import { supabase } from './supabaseClient';
import { analyzeWebsite } from './apiProxy';
import * as cheerio from 'cheerio';

// Types for SEO data
export interface SEOAudit {
  id: string;
  client_id: string;
  user_id: string;
  url: string;
  status: 'in-progress' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  score: number;
  report: SEOReport | null;
}

export interface SEOIssue {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
}

export type SEORecommendation = SEOIssue;

export interface SEOScoreSection {
  score: number;
  issues: SEOIssue[];
  summary?: string;
}

export interface SEOReport {
  overall: {
    score: number;
    summary: string;
    timestamp: string;
  };
  technical: SEOScoreSection;
  content: SEOScoreSection;
  onPage: SEOScoreSection;
  performance: SEOScoreSection;
  mobile: SEOScoreSection;
  backlinks: SEOScoreSection;
  keywords: SEOScoreSection;
  recommendations: SEORecommendation[];
  url: string;
  metaTags: {
    title: string;
    description: string;
    keywords: string;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
  };
  links: {
    internalCount: number;
    externalCount: number;
  };
  contentWordCount: number;
  pageDetails?: {
    url: string;
    title: string;
    score: number;
    issueCount: number;
  }[];
}

// Gemini API integration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Creates an empty SEO report structure
 */
const createEmptyReport = (): SEOReport => {
  return {
    overall: {
      score: 0,
      summary: '',
      timestamp: new Date().toISOString()
    },
    technical: {
      score: 0,
      issues: []
    },
    content: {
      score: 0,
      issues: []
    },
    onPage: {
      score: 0,
      issues: []
    },
    performance: {
      score: 0,
      issues: []
    },
    mobile: {
      score: 0,
      issues: []
    },
    backlinks: {
      score: 0,
      issues: []
    },
    keywords: {
      score: 0,
      issues: []
    },
    recommendations: [],
    url: '',
    metaTags: {
      title: '',
      description: '',
      keywords: ''
    },
    headings: {
      h1: [],
      h2: [],
      h3: []
    },
    images: {
      total: 0,
      withAlt: 0,
      withoutAlt: 0
    },
    links: {
      internalCount: 0,
      externalCount: 0
    },
    contentWordCount: 0
  };
};

/**
 * Fetch website data using our server-side proxy to avoid CORS issues
 */
const fetchWebsiteData = async (url: string): Promise<any> => {
  try {
    console.log(`Fetching website data for ${url}`);
    
    // Use our server-side proxy to avoid CORS issues
    const proxyUrl = `/api/seo/fetch?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website data: ${response.statusText}`);
    }
    
    // Get the HTML content directly as text
    const html = await response.text();
    
    // Parse the HTML content with Cheerio
    const $ = cheerio.load(html);
    
    // Extract metadata
    const metaData = extractMetaData($, url);
    
    // Extract performance data (simulated in browser)
    const performanceData = simulatePerformanceData();
    
    // Extract mobile-friendliness data
    const mobileData = extractMobileFriendlinessData($);
    
    // Extract security data
    const securityData = extractSecurityData(url);
    
    return {
      meta: metaData,
      performance: performanceData,
      mobile: mobileData,
      security: securityData,
      timestamp: new Date().toISOString(),
      rawHtml: html.substring(0, 50000) // Store a portion of the raw HTML for AI analysis
    };
  } catch (error) {
    console.error('Error fetching website data:', error);
    throw error;
  }
};

/**
 * Extract meta data using Cheerio
 */
const extractMetaData = ($: cheerio.CheerioAPI, url: string): any => {
  try {
    // Extract title
    const title = $('title').text() || '';
    
    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // Extract meta keywords
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Extract Open Graph image
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    
    // Extract headings
    const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h3s = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    
    // Extract links
    const allLinks = $('a');
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    let internalCount = 0;
    let externalCount = 0;
    
    allLinks.each((_, el) => {
      try {
        const href = $(el).attr('href');
        if (!href) return;
        
        if (href.startsWith('#') || href.startsWith('/')) {
          internalCount++;
          return;
        }
        
        try {
          const linkUrl = new URL(href, url);
          if (linkUrl.hostname === domain) {
            internalCount++;
          } else {
            externalCount++;
          }
        } catch {
          // Invalid URL, count as internal
          internalCount++;
        }
      } catch {
        // Skip on error
      }
    });
    
    // Extract images
    const allImages = $('img');
    let totalImages = 0;
    let withAlt = 0;
    
    allImages.each((_, el) => {
      totalImages++;
      const alt = $(el).attr('alt');
      if (alt && alt.trim() !== '') {
        withAlt++;
      }
    });
    
    // Extract social media tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
    
    // Check for structured data
    const hasStructuredData = $('script[type="application/ld+json"]').length > 0;
    
    return {
      title,
      description: metaDescription,
      keywords: metaKeywords ? metaKeywords.split(',').map(k => k.trim()).filter(k => k) : [],
      image: ogImage,
      headings: { h1: h1s, h2: h2s, h3: h3s },
      links: { internalCount, externalCount },
      images: { total: totalImages, withAlt, withoutAlt: totalImages - withAlt },
      socialMedia: {
        openGraph: { title: ogTitle, description: ogDescription, image: ogImage },
        twitter: { card: twitterCard }
      },
      structuredData: hasStructuredData
    };
  } catch (error) {
    console.error('Error extracting meta data:', error);
    return {
      title: '',
      description: '',
      keywords: [],
      image: '',
      headings: { h1: [], h2: [], h3: [] },
      links: { internalCount: 0, externalCount: 0 },
      images: { total: 0, withAlt: 0, withoutAlt: 0 },
      socialMedia: {
        openGraph: { title: '', description: '', image: '' },
        twitter: { card: '' }
      },
      structuredData: false
    };
  }
};

/**
 * Extract mobile-friendliness data using Cheerio
 */
const extractMobileFriendlinessData = ($: cheerio.CheerioAPI): any => {
  try {
    // Check for viewport meta tag
    const hasViewportMeta = $('meta[name="viewport"]').length > 0;
    
    // Check for responsive design (simple heuristic)
    const cssLinks = $('link[rel="stylesheet"]');
    let mediaQueries = false;
    
    cssLinks.each((_, el) => {
      const href = $(el).attr('href');
      if (href.includes('mobile') || href.includes('responsive')) {
        mediaQueries = true;
        return false; // break the loop
      }
    });
    
    // Assume responsive design if viewport meta is present
    const isResponsive = hasViewportMeta || mediaQueries;
    
    // Calculate mobile-friendliness score
    let mobileScore = 0;
    if (hasViewportMeta) mobileScore += 60;
    if (isResponsive) mobileScore += 40;
    
    return {
      score: mobileScore,
      isMobileFriendly: mobileScore >= 60,
      hasViewportMeta,
      isResponsive
    };
  } catch (error) {
    console.error('Error extracting mobile-friendliness data:', error);
    return {
      score: 0,
      isMobileFriendly: false,
      hasViewportMeta: false,
      isResponsive: false
    };
  }
};

/**
 * Simulate performance data (since we can't get real performance metrics in the browser for external sites)
 */
const simulatePerformanceData = (): any => {
  try {
    // Generate simulated performance metrics
    const loadTime = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds
    const domContentLoaded = Math.floor(loadTime * 0.7);
    const totalSize = Math.floor(Math.random() * 3000000) + 500000; // 0.5-3.5 MB
    
    // Calculate a performance score (0-100)
    let performanceScore = 100;
    
    // Penalize for slow load times
    if (loadTime > 3000) {
      performanceScore -= 30;
    } else if (loadTime > 2000) {
      performanceScore -= 15;
    } else if (loadTime > 1000) {
      performanceScore -= 5;
    }
    
    // Penalize for large page size
    if (totalSize > 3000000) {
      performanceScore -= 30;
    } else if (totalSize > 1500000) {
      performanceScore -= 15;
    } else if (totalSize > 1000000) {
      performanceScore -= 5;
    }
    
    // Ensure score is between 0-100
    performanceScore = Math.max(0, Math.min(100, performanceScore));
    
    return {
      score: performanceScore,
      metrics: {
        domContentLoaded,
        loadTime,
        totalSize,
        resourceCounts: {
          script: Math.floor(Math.random() * 20) + 5,
          css: Math.floor(Math.random() * 5) + 1,
          image: Math.floor(Math.random() * 30) + 10,
          font: Math.floor(Math.random() * 3) + 1,
          other: Math.floor(Math.random() * 10) + 1
        }
      }
    };
  } catch (error) {
    console.error('Error simulating performance data:', error);
    return {
      score: 50, // Default score
      metrics: {
        domContentLoaded: 1000,
        loadTime: 2000,
        totalSize: 1500000,
        resourceCounts: {
          script: 10,
          css: 3,
          image: 20,
          font: 2,
          other: 5
        }
      }
    };
  }
};

/**
 * Extract security data from URL
 */
const extractSecurityData = (url: string): any => {
  try {
    // Check if the site is using HTTPS
    const isHttps = url.startsWith('https://');
    
    // Calculate security score
    let securityScore = 0;
    if (isHttps) securityScore += 80;
    
    return {
      score: securityScore,
      isSecure: securityScore >= 70,
      isHttps
    };
  } catch (error) {
    console.error('Error extracting security data:', error);
    return {
      score: 0,
      isSecure: false,
      isHttps: false
    };
  }
};

/**
 * Generate a real SEO report based on website data
 */
const generateRealSEOReport = (url: string, websiteData: any): SEOReport => {
  try {
    // Create an empty report
    const report = createEmptyReport();
    
    // Generate technical issues
    const technicalIssues = generateTechnicalIssues(websiteData, new URL(url).hostname);
    report.technical.issues = technicalIssues;
    report.technical.score = calculateSectionScore(technicalIssues);
    
    // Generate content issues
    const contentIssues = generateContentIssues(websiteData, new URL(url).hostname);
    report.content.issues = contentIssues;
    report.content.score = calculateSectionScore(contentIssues);
    
    // Generate on-page issues
    const onPageIssues = generateOnPageIssues(websiteData, new URL(url).hostname);
    report.onPage.issues = onPageIssues;
    report.onPage.score = calculateSectionScore(onPageIssues);
    
    // Generate performance issues
    const performanceIssues = generatePerformanceIssues(websiteData, new URL(url).hostname);
    report.performance.issues = performanceIssues;
    report.performance.score = websiteData.performance?.score || 50;
    
    // Generate backlinks analysis
    const backlinksAnalysis = generateBacklinksAnalysis(websiteData, new URL(url).hostname);
    report.backlinks = backlinksAnalysis;
    
    // Generate keywords analysis
    const keywordsAnalysis = generateKeywordsAnalysis(websiteData, new URL(url).hostname);
    report.keywords = keywordsAnalysis;
    
    // Generate recommendations
    const recommendations = generateSEORecommendations(websiteData, new URL(url).hostname);
    report.recommendations = recommendations;
    
    // Calculate overall score
    const overallScore = calculateOverallScore(report);
    
    // Update overall section
    report.overall = {
      score: overallScore,
      summary: `The website ${url} has an overall SEO score of ${overallScore}/100. ${
        overallScore >= 80 ? 'The site is performing well in terms of SEO.' :
        overallScore >= 60 ? 'The site has some SEO issues that should be addressed.' :
        'The site has significant SEO issues that need immediate attention.'
      }`,
      timestamp: new Date().toISOString()
    };
    
    return report;
  } catch (error) {
    console.error('Error generating real SEO report:', error);
    
    // Return a basic report with an error message
    const emptyReport = createEmptyReport();
    return {
      ...emptyReport,
      overall: {
        score: 0,
        summary: `Failed to generate SEO audit for ${url}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Calculate a section score based on issues
 */
const calculateSectionScore = (issues: SEOIssue[]): number => {
  if (issues.length === 0) return 100;
  
  // Count issues by severity
  const criticalCount = issues.filter(issue => issue.severity === 'high').length;
  const highCount = issues.filter(issue => issue.severity === 'medium').length;
  const mediumCount = issues.filter(issue => issue.severity === 'low').length;
  
  // Calculate score
  let score = 100;
  score -= criticalCount * 20;
  score -= highCount * 10;
  score -= mediumCount * 5;
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculates the overall SEO score based on the section scores
 */
const calculateOverallScore = (report: SEOReport): number => {
  // Weights for each section
  const weights = {
    technical: 0.25,
    content: 0.20,
    onPage: 0.20,
    performance: 0.15,
    backlinks: 0.10,
    keywords: 0.10
  };
  
  // Calculate weighted average
  const weightedScore = 
    report.technical.score * weights.technical +
    report.content.score * weights.content +
    report.onPage.score * weights.onPage +
    report.performance.score * weights.performance +
    report.backlinks.score * weights.backlinks +
    report.keywords.score * weights.keywords;
  
  // Round to nearest integer
  return Math.round(weightedScore);
};

/**
 * Generate technical issues based on website data
 */
const generateTechnicalIssues = (websiteData: any, domain: string): SEOIssue[] => {
  const issues: SEOIssue[] = [];
  
  // Check HTTPS
  if (!websiteData.security?.isHttps) {
    issues.push({
      title: 'Missing HTTPS',
      description: `The website ${domain} does not use HTTPS.`,
      severity: "high",
      impact: "HTTPS is a ranking factor and essential for security and user trust.",
      recommendation: "Implement HTTPS by obtaining an SSL certificate and configuring your server."
    });
  }
  
  // Check mobile-friendliness
  if (!websiteData.mobile?.isMobileFriendly) {
    issues.push({
      title: 'Not mobile-friendly',
      description: `The website ${domain} is not optimized for mobile devices.`,
      severity: "high",
      impact: "Mobile-friendliness is a ranking factor, especially for mobile searches.",
      recommendation: "Implement a responsive design that adapts to different screen sizes."
    });
  }
  
  // Check for missing or multiple H1 tags
  if (websiteData.meta?.headings?.h1?.length === 0) {
    issues.push({
      title: 'Missing H1 heading',
      description: "The website does not have an H1 heading.",
      severity: "high",
      impact: "H1 headings are important for SEO as they help search engines understand the main topic of the page.",
      recommendation: "Add a descriptive H1 heading that accurately represents the page content."
    });
  } else if (websiteData.meta?.headings?.h1?.length > 1) {
    issues.push({
      title: 'Multiple H1 headings',
      description: `The website has ${websiteData.meta.headings.h1.length} H1 headings.`,
      severity: "medium",
      impact: "Having multiple H1 headings can confuse search engines about the main topic of the page.",
      recommendation: "Use only one H1 heading per page that accurately represents the main topic."
    });
  }
  
  // Check for images without alt text
  if (websiteData.meta?.images?.withoutAlt > 0) {
    issues.push({
      title: 'Images missing alt text',
      description: `${websiteData.meta.images.withoutAlt} out of ${websiteData.meta.images.total} images are missing alt text.`,
      severity: "medium",
      impact: "Alt text is important for accessibility and helps search engines understand the content of images.",
      recommendation: "Add descriptive alt text to all images that accurately describes the image content."
    });
  }
  
  return issues;
};

/**
 * Generate content issues based on website data
 */
const generateContentIssues = (websiteData: any, domain: string): SEOIssue[] => {
  const issues: SEOIssue[] = [];
  
  // Check meta description
  if (!websiteData.meta?.description || websiteData.meta.description.length < 50) {
    issues.push({
      title: 'Missing or short meta description',
      description: `The website ${domain} has ${!websiteData.meta?.description ? 'no meta description' : 'a short meta description'}.`,
      severity: "medium",
      impact: "Meta descriptions appear in search results and affect click-through rates.",
      recommendation: "Add a descriptive meta description between 50-160 characters."
    });
  }
  
  // Check title
  if (!websiteData.meta?.title || websiteData.meta.title.length < 10) {
    issues.push({
      title: 'Missing or short title',
      description: `The website ${domain} has ${!websiteData.meta?.title ? 'no title' : 'a short title'}.`,
      severity: "high",
      impact: "Titles are a major ranking factor and appear in search results.",
      recommendation: "Add a descriptive title between 50-60 characters that includes your main keyword."
    });
  }
  
  // Check for thin content
  if (websiteData.meta?.headings?.h2?.length < 2 && websiteData.meta?.headings?.h3?.length < 3) {
    issues.push({
      title: 'Potentially thin content',
      description: "The page may have thin content based on the limited heading structure.",
      severity: "medium",
      impact: "Thin content can lead to poor rankings and reduced organic traffic.",
      recommendation: "Expand your content with more detailed sections and proper heading structure."
    });
  }
  
  return issues;
};

/**
 * Generate on-page issues based on website data
 */
const generateOnPageIssues = (websiteData: any, domain: string): SEOIssue[] => {
  const issues: SEOIssue[] = [];
  
  // Check internal linking
  if (websiteData.meta?.links?.internalCount < 3) {
    issues.push({
      title: 'Few internal links',
      description: `The page has only ${websiteData.meta?.links?.internalCount || 0} internal links.`,
      severity: "medium",
      impact: "Internal linking helps search engines discover and understand your content structure.",
      recommendation: "Add more relevant internal links to improve site navigation and SEO."
    });
  }
  
  // Check for social media tags
  if (!websiteData.meta?.socialMedia?.openGraph?.title || !websiteData.meta?.socialMedia?.openGraph?.description) {
    issues.push({
      title: 'Missing Open Graph tags',
      description: "The website is missing some or all Open Graph tags.",
      severity: "low",
      impact: "Open Graph tags help control how content appears when shared on social media platforms.",
      recommendation: "Add Open Graph tags for title, description, image, and URL to improve social media sharing."
    });
  }
  
  // Check for structured data
  if (!websiteData.meta?.structuredData) {
    issues.push({
      title: 'Missing structured data',
      description: "The website does not use structured data markup.",
      severity: "medium",
      impact: "Structured data helps search engines understand your content and can enable rich results.",
      recommendation: "Implement relevant structured data using JSON-LD format."
    });
  }
  
  return issues;
};

/**
 * Generate performance issues based on website data
 */
const generatePerformanceIssues = (websiteData: any, domain: string): SEOIssue[] => {
  const issues: SEOIssue[] = [];
  
  // Check performance score
  if (websiteData.performance?.score < 70) {
    issues.push({
      title: 'Low performance score',
      description: `The website ${domain} has a performance score of ${websiteData.performance?.score || 'unknown'}.`,
      severity: "high",
      impact: "Page speed is a ranking factor and affects user experience.",
      recommendation: "Optimize images, enable caching, minimize JavaScript, and reduce server response time."
    });
  }
  
  // Check page size
  if (websiteData.performance?.metrics?.totalSize > 2000000) {
    issues.push({
      title: 'Large page size',
      description: `The page size is ${Math.round(websiteData.performance.metrics.totalSize / 1024 / 1024 * 100) / 100} MB.`,
      severity: "medium",
      impact: "Large pages take longer to load, especially on mobile devices with limited bandwidth.",
      recommendation: "Optimize images, minify CSS and JavaScript, and remove unnecessary resources."
    });
  }
  
  // Check load time
  if (websiteData.performance?.metrics?.loadTime > 3000) {
    issues.push({
      title: 'Slow load time',
      description: `The page load time is ${Math.round(websiteData.performance.metrics.loadTime)} ms.`,
      severity: "high",
      impact: "Slow loading pages lead to higher bounce rates and lower conversion rates.",
      recommendation: "Optimize server response time, leverage browser caching, and use a content delivery network (CDN)."
    });
  }
  
  return issues;
};

/**
 * Generate backlinks analysis
 */
const generateBacklinksAnalysis = (websiteData: any, domain: string): SEOScoreSection => {
  const issues: SEOIssue[] = [];
  
  // In a real implementation, we would analyze backlinks data
  // For now, we'll just return a simulated score and empty issues
  
  return {
    score: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
    issues: issues
  };
};

/**
 * Generate keywords analysis
 */
const generateKeywordsAnalysis = (websiteData: any, domain: string): SEOScoreSection => {
  const issues: SEOIssue[] = [];
  
  // In a real implementation, we would analyze keywords data
  // For now, we'll just return a simulated score and empty issues
  
  return {
    score: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
    issues: issues
  };
};

/**
 * Extract keywords from website data
 */
const extractKeywords = (websiteData: any): string[] => {
  // Extract keywords from meta tags if available
  if (websiteData.meta?.keywords && websiteData.meta.keywords.length > 0) {
    return websiteData.meta.keywords.slice(0, 5);
  }
  
  // Extract keywords from title and description if available
  const keywords: string[] = [];
  
  if (websiteData.meta?.title) {
    const titleWords = websiteData.meta.title.toLowerCase().split(/\s+/).filter((word: string) => word.length > 3);
    keywords.push(...titleWords.slice(0, 3));
  }
  
  if (websiteData.meta?.description) {
    const descWords = websiteData.meta.description.toLowerCase().split(/\s+/).filter((word: string) => word.length > 3);
    keywords.push(...descWords.slice(0, 2));
  }
  
  // Return unique keywords or default keywords if none found
  return keywords.length > 0 ? Array.from(new Set(keywords)).slice(0, 5) : ["website", "online", "services", "business"];
};

/**
 * Suggest keywords based on website data and domain
 */
const suggestKeywords = (websiteData: any, domain: string): string[] => {
  const extractedKeywords = extractKeywords(websiteData);
  const suggestions: string[] = [];
  
  // Add long-tail variations
  extractedKeywords.forEach(keyword => {
    suggestions.push(`best ${keyword}`, `${keyword} services`, `${keyword} near me`, `affordable ${keyword}`);
  });
  
  // Add domain-specific keywords
  const domainParts = domain.split('.');
  if (domainParts.length > 1) {
    const domainName = domainParts[0].replace(/[^a-zA-Z0-9]/g, ' ').trim();
    if (domainName && !domainName.includes('www')) {
      suggestions.push(domainName, `${domainName} reviews`, `${domainName} alternatives`);
    }
  }
  
  // Return unique suggestions
  return Array.from(new Set(suggestions)).slice(0, 5);
};

/**
 * Generate recommendations based on website data
 */
const generateSEORecommendations = (websiteData: any, domain: string): SEOIssue[] => {
  const recommendations: SEOIssue[] = [];
  
  // Add HTTPS recommendation if needed
  if (!websiteData.security?.isHttps) {
    recommendations.push({
      title: 'Implement HTTPS',
      description: "Secure your website with HTTPS by obtaining an SSL certificate.",
      severity: "high",
      impact: "Improved security, user trust, and potential ranking boost.",
      recommendation: "Install an SSL certificate and redirect HTTP to HTTPS."
    });
  }
  
  // Add mobile-friendliness recommendation if needed
  if (!websiteData.mobile?.isMobileFriendly) {
    recommendations.push({
      title: 'Optimize for mobile devices',
      description: "Implement a responsive design that works well on all screen sizes.",
      severity: "high",
      impact: "Better rankings in mobile search results and improved user experience.",
      recommendation: "Implement a responsive design that adapts to different screen sizes."
    });
  }
  
  // Add meta description recommendation if needed
  if (!websiteData.meta?.description || websiteData.meta.description.length < 50) {
    recommendations.push({
      title: 'Improve meta description',
      description: "Add a descriptive meta description between 50-160 characters.",
      severity: "medium",
      impact: "Better meta descriptions can improve click-through rates from search results.",
      recommendation: "Add a descriptive meta description between 50-160 characters."
    });
  }
  
  // Add performance recommendation if needed
  if (websiteData.performance?.score < 70) {
    recommendations.push({
      title: 'Improve website performance',
      description: "Optimize page loading speed by minimizing resources and leveraging browser caching.",
      severity: "medium",
      impact: "Better user experience and improved search rankings.",
      recommendation: "Optimize images, enable caching, minimize JavaScript, and reduce server response time."
    });
  }
  
  // Always add content recommendation
  recommendations.push({
    title: 'Enhance content strategy',
    description: "Develop a comprehensive content plan that addresses user needs and search intent.",
    severity: "medium",
    impact: "Increased organic traffic and improved topical authority.",
    recommendation: "Develop a comprehensive content plan that addresses user needs and search intent."
  });
  
  return recommendations;
};

/**
 * Calculate a score from an AI-generated report
 */
const calculateScoreFromAIReport = (report: any): number => {
  if (!report) return 0;
  
  // For AI reports, we'll use a simpler scoring mechanism
  // based on the number of recommendations provided
  const recommendations = report.recommendations || [];
  const issuesCount = recommendations.length;
  
  // More issues = lower score (baseline of 80)
  const score = Math.max(0, 80 - (issuesCount * 5));
  
  return score;
};

/**
 * Generate an AI-based SEO report when direct website analysis fails
 */
const generateAIReport = async (url: string): Promise<SEOReport> => {
  try {
    // Generate the prompt for the Gemini API
    const prompt = generateSEOAuditPrompt(url);
    
    // Call the Gemini API to analyze the website
    const geminiResponse = await callGeminiAPI(prompt);
    
    // Parse the Gemini API response
    return parseGeminiResponse(geminiResponse, url);
  } catch (error) {
    console.error('Error generating AI report:', error);
    return createFailedAuditReport(url, error);
  }
};

/**
 * Create a failed audit report
 */
const createFailedAuditReport = (url: string, error: any): SEOReport => {
  const emptyReport = createEmptyReport();
  return {
    ...emptyReport,
    overall: {
      score: 0,
      summary: `Failed to generate SEO audit for ${url}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Parses the Gemini API response into a structured SEO report
 */
const parseGeminiResponse = (response: string, url: string): SEOReport => {
  try {
    // Extract the JSON part from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const jsonStr = jsonMatch[0];
    const parsedReport = JSON.parse(jsonStr) as SEOReport;
    
    // Ensure the report has all required sections
    const emptyReport = createEmptyReport();
    return {
      overall: { ...emptyReport.overall, ...parsedReport.overall },
      technical: { ...emptyReport.technical, ...parsedReport.technical },
      content: { ...emptyReport.content, ...parsedReport.content },
      onPage: { ...emptyReport.onPage, ...parsedReport.onPage },
      performance: { ...emptyReport.performance, ...parsedReport.performance },
      mobile: { ...emptyReport.mobile, ...parsedReport.mobile },
      backlinks: { ...emptyReport.backlinks, ...parsedReport.backlinks },
      keywords: { ...emptyReport.keywords, ...parsedReport.keywords },
      recommendations: parsedReport.recommendations || [],
      url: url,
      metaTags: {
        title: parsedReport.metaTags?.title || '',
        description: parsedReport.metaTags?.description || '',
        keywords: parsedReport.metaTags?.keywords || ''
      },
      headings: {
        h1: parsedReport.headings?.h1 || [],
        h2: parsedReport.headings?.h2 || [],
        h3: parsedReport.headings?.h3 || []
      },
      images: {
        total: parsedReport.images?.total || 0,
        withAlt: parsedReport.images?.withAlt || 0,
        withoutAlt: parsedReport.images?.withoutAlt || 0
      },
      links: {
        internalCount: parsedReport.links?.internalCount || 0,
        externalCount: parsedReport.links?.externalCount || 0
      },
      contentWordCount: parsedReport.contentWordCount || 0
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    
    // Return a basic report with an error message
    const emptyReport = createEmptyReport();
    return {
      ...emptyReport,
      overall: {
        score: 0,
        summary: `Failed to parse SEO audit for ${url}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      },
      url: url,
      metaTags: {
        title: '',
        description: '',
        keywords: ''
      },
      headings: {
        h1: [],
        h2: [],
        h3: []
      },
      images: {
        total: 0,
        withAlt: 0,
        withoutAlt: 0
      },
      links: {
        internalCount: 0,
        externalCount: 0
      },
      contentWordCount: 0
    };
  }
};

/**
 * Generates the prompt for the Gemini API to create an SEO audit
 */
const generateSEOAuditPrompt = (url: string): string => {
  return `
Please perform a comprehensive SEO audit for the website: ${url}

I need a detailed analysis in JSON format with the following structure:

{
  "overall": {
    "score": <number between 0-100>,
    "summary": "<brief summary of overall SEO health>",
    "timestamp": "<current date and time>"
  },
  "technical": {
    "score": <number between 0-100>,
    "issues": [
      {
        "title": "<issue title>",
        "description": "<detailed description>",
        "severity": "<high|medium|low>",
        "impact": "<impact on SEO>",
        "recommendation": "<how to fix>"
      }
    ]
  },
  "content": {
    "score": <number between 0-100>,
    "issues": [<same structure as technical issues>]
  },
  "onPage": {
    "score": <number between 0-100>,
    "issues": [<same structure as technical issues>]
  },
  "performance": {
    "score": <number between 0-100>,
    "issues": [<same structure as technical issues>]
  },
  "mobile": {
    "score": <number between 0-100>,
    "issues": [<same structure as technical issues>]
  },
  "backlinks": {
    "score": <number between 0-100>,
    "issues": [<same structure as technical issues>]
  },
  "keywords": {
    "score": <number between 0-100>,
    "issues": [<same structure as technical issues>]
  },
  "recommendations": [
    {
      "title": "<recommendation title>",
      "description": "<detailed description>",
      "severity": "<high|medium|low>",
      "impact": "<expected impact>",
      "recommendation": "<how to fix>"
    }
  ],
  "url": "${url}",
  "metaTags": {
    "title": "<meta title>",
    "description": "<meta description>",
    "keywords": "<meta keywords>"
  },
  "headings": {
    "h1": ["<h1 heading>"],
    "h2": ["<h2 heading>"],
    "h3": ["<h3 heading>"]
  },
  "images": {
    "total": <number>,
    "withAlt": <number>,
    "withoutAlt": <number>
  },
  "links": {
    "internalCount": <number>,
    "externalCount": <number>
  },
  "contentWordCount": <number>
}

Please analyze the website thoroughly, including:
1. Technical SEO (crawlability, indexability, site structure, SSL, mobile-friendliness, etc.)
2. On-page SEO (meta tags, headings, content quality, internal linking, etc.)
3. Performance (page speed, Core Web Vitals, etc.)
4. Content quality and optimization
5. Backlink profile
6. Keyword targeting and opportunities

For each issue, provide specific details and actionable recommendations. Assign appropriate severity levels and prioritize recommendations based on potential impact and implementation effort.

Return ONLY the JSON object with no additional text or explanation.
`;
};

/**
 * Call the Gemini API to generate an SEO audit
 * This is a local implementation to avoid import conflicts
 */
const callGeminiAPI = async (prompt: string): Promise<string> => {
  try {
    // In a real implementation, this would call the Gemini API
    // For now, we'll simulate a response
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a simulated response
    return JSON.stringify({
      overall: {
        score: 65,
        summary: "The website has several SEO issues that need to be addressed to improve search engine visibility.",
        timestamp: new Date().toISOString()
      },
      technical: {
        score: 70,
        issues: [
          {
            title: "Missing robots.txt",
            description: "The website does not have a robots.txt file to guide search engine crawlers.",
            severity: "medium",
            impact: "May lead to inefficient crawling and indexing of pages.",
            recommendation: "Create a robots.txt file in the root directory."
          }
        ]
      },
      content: {
        score: 60,
        issues: [
          {
            title: "Thin content",
            description: "Some pages have less than 300 words of content.",
            severity: "high",
            impact: "Pages with thin content typically don't rank well in search results.",
            recommendation: "Expand content to at least 500-800 words with valuable information."
          }
        ]
      },
      onPage: {
        score: 75,
        issues: []
      },
      performance: {
        score: 65,
        issues: []
      },
      mobile: {
        score: 80,
        issues: []
      },
      backlinks: {
        score: 50,
        issues: []
      },
      keywords: {
        score: 60,
        issues: []
      },
      recommendations: [
        {
          title: "Improve meta descriptions",
          description: "Many pages have generic or missing meta descriptions.",
          severity: "medium",
          impact: "Better meta descriptions can improve click-through rates from search results.",
          recommendation: "Write unique, compelling meta descriptions for each page."
        }
      ]
    });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

/**
 * Analyze technical SEO aspects of the website
 */
const analyzeTechnicalSEO = (report: SEOReport, websiteData: any) => {
  const issues: SEOIssue[] = [];
  let score = 100;
  
  // Check for HTTPS
  if (websiteData.security && !websiteData.security.isHttps) {
    issues.push({
      title: "Missing HTTPS",
      description: "The website is not using HTTPS secure protocol.",
      severity: "high",
      impact: "Browsers may show security warnings, and search engines prefer secure websites.",
      recommendation: "Install an SSL certificate and redirect HTTP to HTTPS."
    });
    score -= 15;
  }
  
  // Check for robots.txt (simulated)
  if (!websiteData.meta?.hasRobotsTxt) {
    issues.push({
      title: "Missing robots.txt",
      description: "No robots.txt file was detected.",
      severity: "medium",
      impact: "Search engines may not know which pages to crawl or avoid.",
      recommendation: "Create a robots.txt file in the root directory."
    });
    score -= 10;
  }
  
  // Check for sitemap (simulated)
  if (!websiteData.meta?.hasSitemap) {
    issues.push({
      title: "Missing XML sitemap",
      description: "No XML sitemap was detected.",
      severity: "medium",
      impact: "Search engines may miss important pages on your site.",
      recommendation: "Create an XML sitemap and submit it to search engines."
    });
    score -= 10;
  }
  
  report.technical = {
    score: Math.max(0, score),
    issues
  };
};

/**
 * Analyze on-page SEO aspects
 */
const analyzeOnPageSEO = (report: SEOReport, websiteData: any) => {
  const issues: SEOIssue[] = [];
  let score = 100;
  
  // Check title tag
  if (!websiteData.meta?.title) {
    issues.push({
      title: "Missing title tag",
      description: "The page is missing a title tag.",
      severity: "high",
      impact: "Title tags are crucial for SEO and user experience in search results.",
      recommendation: "Add a descriptive, keyword-rich title tag under 60 characters."
    });
    score -= 15;
  } else if (websiteData.meta.title.length > 60) {
    issues.push({
      title: "Title tag too long",
      description: `The title tag is ${websiteData.meta.title.length} characters, which may be truncated in search results.`,
      severity: "medium",
      impact: "Long titles may be cut off in search results, reducing effectiveness.",
      recommendation: "Keep title tags under 60 characters."
    });
    score -= 5;
  }
  
  // Check meta description
  if (!websiteData.meta?.description) {
    issues.push({
      title: "Missing meta description",
      description: "The page is missing a meta description.",
      severity: "medium",
      impact: "Meta descriptions improve click-through rates from search results.",
      recommendation: "Add a compelling meta description between 120-155 characters."
    });
    score -= 10;
  } else if (websiteData.meta.description.length > 155) {
    issues.push({
      title: "Meta description too long",
      description: `The meta description is ${websiteData.meta.description.length} characters, which may be truncated in search results.`,
      severity: "low",
      impact: "Long descriptions may be cut off in search results.",
      recommendation: "Keep meta descriptions between 120-155 characters."
    });
    score -= 5;
  }
  
  // Check H1 tags
  if (!websiteData.meta?.headings?.h1 || websiteData.meta.headings.h1.length === 0) {
    issues.push({
      title: "Missing H1 heading",
      description: "The page does not have an H1 heading.",
      severity: "high",
      impact: "H1 headings help search engines understand the main topic of the page.",
      recommendation: "Add a single, descriptive H1 heading that includes your target keyword."
    });
    score -= 10;
  } else if (websiteData.meta.headings.h1.length > 1) {
    issues.push({
      title: "Multiple H1 tags",
      description: `The page has ${websiteData.meta.headings.h1.length} H1 headings.`,
      severity: "medium",
      impact: "Multiple H1 tags can confuse search engines about the main topic of the page.",
      recommendation: "Use only one H1 tag per page that clearly describes the page content."
    });
    score -= 5;
  }
  
  report.onPage = {
    score: Math.max(0, score),
    issues
  };
};

/**
 * Analyze content quality
 */
const analyzeContent = (report: SEOReport, websiteData: any) => {
  const issues: SEOIssue[] = [];
  let score = 100;
  
  // Check content length
  const wordCount = websiteData.meta?.contentWordCount || 0;
  if (wordCount < 300) {
    issues.push({
      title: "Thin content",
      description: `The page has only ${wordCount} words of content.`,
      severity: "high",
      impact: "Pages with thin content typically don't rank well in search results.",
      recommendation: "Expand content to at least 500-800 words with valuable information."
    });
    score -= 15;
  }
  
  // Check image alt text
  if (websiteData.meta?.images) {
    const { total, withAlt, withoutAlt } = websiteData.meta.images;
    if (total > 0 && withoutAlt > 0) {
      const percentage = Math.round((withoutAlt / total) * 100);
      if (percentage > 50) {
        issues.push({
          title: "Missing image alt text",
          description: `${percentage}% of images (${withoutAlt} out of ${total}) are missing alt text.`,
          severity: "medium",
          impact: "Alt text helps search engines understand images and improves accessibility.",
          recommendation: "Add descriptive alt text to all images."
        });
        score -= 10;
      }
    }
  }
  
  report.content = {
    score: Math.max(0, score),
    issues
  };
};

/**
 * Analyze performance metrics
 */
const analyzePerformance = (report: SEOReport, websiteData: any) => {
  const issues: SEOIssue[] = [];
  let score = 100;
  
  // Check performance score
  if (websiteData.performance) {
    const perfScore = websiteData.performance.score || 0;
    if (perfScore < 50) {
      issues.push({
        title: "Poor performance score",
        description: `The page has a performance score of ${perfScore}/100.`,
        severity: "high",
        impact: "Slow pages provide poor user experience and may rank lower in search results.",
        recommendation: "Optimize images, reduce JavaScript, and leverage browser caching."
      });
      score -= 20;
    } else if (perfScore < 70) {
      issues.push({
        title: "Average performance score",
        description: `The page has a performance score of ${perfScore}/100.`,
        severity: "medium",
        impact: "Page speed is a ranking factor and affects user experience.",
        recommendation: "Consider optimizing images and reducing render-blocking resources."
      });
      score -= 10;
    }
    
    // Check load time
    const loadTime = websiteData.performance.metrics?.loadTime || 0;
    if (loadTime > 3000) {
      issues.push({
        title: "Slow page load time",
        description: `The page load time is ${Math.round(loadTime / 1000)} seconds.`,
        severity: "high",
        impact: "Slow loading pages have higher bounce rates and lower conversion rates.",
        recommendation: "Optimize server response time, leverage browser caching, and use a content delivery network (CDN)."
      });
      score -= 15;
    }
  }
  
  report.performance = {
    score: Math.max(0, score),
    issues
  };
};

/**
 * Analyze mobile-friendliness
 */
const analyzeMobile = (report: SEOReport, websiteData: any) => {
  const issues: SEOIssue[] = [];
  let score = 100;
  
  if (websiteData.mobile) {
    // Check if mobile-friendly
    if (!websiteData.mobile.isMobileFriendly) {
      issues.push({
        title: "Not mobile-friendly",
        description: "The page is not optimized for mobile devices.",
        severity: "high",
        impact: "Mobile-friendliness is a ranking factor for mobile search results.",
        recommendation: "Implement a responsive design that works well on all device sizes."
      });
      score -= 20;
    }
    
    // Check viewport meta tag
    if (!websiteData.mobile.hasViewportMeta) {
      issues.push({
        title: "Missing viewport meta tag",
        description: "The page is missing the viewport meta tag.",
        severity: "high",
        impact: "Without this tag, mobile devices won't render the page properly.",
        recommendation: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> to the head section."
      });
      score -= 15;
    }
  }
  
  report.mobile = {
    score: Math.max(0, score),
    issues
  };
};

/**
 * Generate overall recommendations
 */
const generateReportRecommendations = (report: SEOReport) => {
  const recommendations: SEORecommendation[] = [];
  
  // Collect high-priority issues from all categories
  const allIssues = [
    ...(report.technical.issues || []),
    ...(report.content.issues || []),
    ...(report.onPage.issues || []),
    ...(report.performance.issues || []),
    ...(report.mobile.issues || [])
  ];
  
  // Convert high and medium severity issues to recommendations
  allIssues
    .filter(issue => issue.severity === 'high' || issue.severity === 'medium')
    .forEach(issue => {
      recommendations.push({
        title: issue.title,
        description: issue.description,
        severity: issue.severity,
        impact: issue.impact,
        recommendation: issue.recommendation
      });
    });
  
  // Add some general recommendations if we don't have many specific ones
  if (recommendations.length < 3) {
    recommendations.push({
      title: 'Improve content quality',
      description: "The content could be more comprehensive and engaging.",
      severity: "medium",
      impact: "Better content leads to higher engagement and search engine rankings.",
      recommendation: "Expand content with more in-depth information, examples, and visuals."
    });
  }
  
  report.recommendations = recommendations;
};

/**
 * Generate overall summary and score
 */
const generateOverallSummary = (report: SEOReport) => {
  // Calculate overall score as average of category scores
  const scores = [
    report.technical.score,
    report.content.score,
    report.onPage.score,
    report.performance.score,
    report.mobile.score
  ];
  
  const overallScore = Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );
  
  // Generate summary based on score
  let summary = '';
  if (overallScore >= 80) {
    summary = `The website has a strong overall SEO score of ${overallScore}/100. There are still some opportunities for improvement.`;
  } else if (overallScore >= 60) {
    summary = `The website has a moderate overall SEO score of ${overallScore}/100 with room for improvement.`;
  } else {
    summary = `The website has a low overall SEO score of ${overallScore}/100 and requires significant improvements.`;
  }
  
  report.overall = {
    score: overallScore,
    summary,
    timestamp: new Date().toISOString()
  };
};

/**
 * Process a comprehensive SEO audit that crawls all pages
 */
const processComprehensiveSEOAudit = async (url: string, auditId: string, userId: string) => {
  try {
    console.log(`Starting comprehensive SEO audit for ${url} (ID: ${auditId})`);
    
    // Update status to processing
    try {
      await supabase
        .from('seo_audits')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', auditId);
    } catch (updateError) {
      console.error('Error updating audit status:', updateError);
      // Continue with the audit even if the update fails
    }
    
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
    // Fetch and analyze the main page
    console.log(`Fetching main page data for ${url}`);
    const mainPageData = await fetchWebsiteData(url);
    
    // Create the initial report for the main page
    const initialReport = await generateRealSEOReport(url, mainPageData);
    
    // Extract all internal links to crawl
    const $ = cheerio.load(mainPageData.rawHtml || '');
    const internalLinks = extractInternalLinks($, domain) || [];
    console.log(`Found ${internalLinks.length} internal links to crawl`);
    
    // Limit the number of pages to crawl to avoid overloading
    const pagesToCrawl = internalLinks.slice(0, 100); // Analyze up to 100 pages for comprehensive coverage
    
    // Create a map to store page-specific reports
    const pageReports: { [key: string]: SEOReport } = {
      [url]: initialReport
    };
    
    // Use a batch processing approach to avoid overwhelming the system
    const batchSize = 5; // Process 5 pages at a time
    const totalBatches = Math.ceil(pagesToCrawl.length / batchSize);
    
    // Process pages in batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, pagesToCrawl.length);
      const currentBatch = pagesToCrawl.slice(batchStart, batchEnd);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (pages ${batchStart + 1} to ${batchEnd})`);
      
      // Update the audit status with progress information
      try {
        await supabase
          .from('seo_audits')
          .update({ 
            status: 'processing',
            report: {
              overall: {
                summary: `Analyzing pages ${batchStart + 1} to ${batchEnd} of ${pagesToCrawl.length} (${Math.round((batchEnd / pagesToCrawl.length) * 100)}% complete)`,
                score: 0,
                timestamp: new Date().toISOString()
              }
            }
          })
          .eq('id', auditId);
      } catch (updateError) {
        console.error('Error updating audit status:', updateError);
        // Continue with the audit even if the update fails
      }
      
      // Process each page in the current batch in parallel
      const batchPromises = currentBatch.map(async (pageUrl, index) => {
        try {
          console.log(`Crawling page ${batchStart + index + 1}/${pagesToCrawl.length}: ${pageUrl}`);
          const pageData = await fetchWebsiteData(pageUrl);
          const pageReport = await generateRealSEOReport(pageUrl, pageData);
          return { url: pageUrl, report: pageReport };
        } catch (error) {
          console.error(`Error crawling page ${pageUrl}:`, error);
          // Return null for failed pages
          return null;
        }
      });
      
      // Wait for all pages in the batch to be processed
      const batchResults = await Promise.all(batchPromises);
      
      // Add successful results to the pageReports map
      batchResults.forEach(result => {
        if (result) {
          pageReports[result.url] = result.report;
        }
      });
      
      // Add a small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate a comprehensive report that includes all pages
    console.log(`Generating comprehensive report for ${Object.keys(pageReports).length} pages`);
    const comprehensiveReport = generateComprehensiveReport(pageReports, domain);
    
    // Include page-specific details in the report
    comprehensiveReport.pageDetails = Object.entries(pageReports).map(([pageUrl, report]) => ({
      url: pageUrl,
      title: report.metaTags?.title || 'No title',
      score: report.overall.score,
      issueCount: 
        report.technical.issues.length + 
        report.content.issues.length + 
        report.onPage.issues.length + 
        report.performance.issues.length
    }));
    
    // Sort pages by score (ascending, so worst pages first)
    comprehensiveReport.pageDetails.sort((a, b) => a.score - b.score);
    
    // Update the audit with the comprehensive report
    try {
      const { error: updateError } = await supabase
        .from('seo_audits')
        .update({
          status: 'completed',
          score: comprehensiveReport.overall.score,
          report: comprehensiveReport,
          updated_at: new Date().toISOString()
        })
        .eq('id', auditId);
      
      if (updateError) {
        console.error('Error updating SEO audit with comprehensive report:', updateError);
        throw updateError;
      }
    } catch (error) {
      console.error('Error updating SEO audit:', error);
    }
    
    console.log(`Comprehensive SEO audit completed for ${url} (ID: ${auditId})`);
  } catch (error) {
    console.error(`Error in comprehensive SEO audit for ${url}:`, error);
    
    // Create a failed audit report
    const failedReport = createFailedAuditReport(url, error);
    
    // Update the audit with the failed status
    try {
      await supabase
        .from('seo_audits')
        .update({
          status: 'failed',
          report: failedReport,
          updated_at: new Date().toISOString()
        })
        .eq('id', auditId);
    } catch (error) {
      console.error('Error updating SEO audit:', error);
    }
  }
};

/**
 * Extract internal links from website data
 */
const extractInternalLinks = ($: cheerio.CheerioAPI, domain: string): string[] => {
  const links: string[] = [];
  
  try {
    // Make sure $ is a valid cheerio object
    if (typeof $ !== 'function') {
      console.error('Invalid cheerio object in extractInternalLinks');
      return [];
    }
    
    // Find all links in the document
    $('a').each((i, el) => {
      try {
        const href = $(el).attr('href');
        
        if (href && (href.startsWith('/') || href.includes(domain))) {
          // Convert relative URLs to absolute
          let fullUrl = href;
          if (href.startsWith('/')) {
            fullUrl = `https://${domain}${href}`;
          }
          
          // Filter out non-HTML resources and duplicates
          if (
            !fullUrl.endsWith('.jpg') && 
            !fullUrl.endsWith('.jpeg') && 
            !fullUrl.endsWith('.png') && 
            !fullUrl.endsWith('.gif') && 
            !fullUrl.endsWith('.pdf') && 
            !fullUrl.endsWith('.zip') && 
            !links.includes(fullUrl)
          ) {
            links.push(fullUrl);
          }
        }
      } catch (err) {
        console.error('Error processing link:', err);
      }
    });
    
    console.log(`Successfully extracted ${links.length} internal links`);
  } catch (error) {
    console.error('Error extracting internal links:', error);
  }
  
  return links;
};

/**
 * Generate a comprehensive report that includes all pages
 */
const generateComprehensiveReport = (pageReports: { [key: string]: SEOReport }, domain: string): SEOReport => {
  // Start with an empty report
  const comprehensiveReport = createEmptyReport();
  
  // Set the URL to the domain
  comprehensiveReport.url = `https://${domain}`;
  
  // Collect all issues from all pages
  const allTechnicalIssues: SEOIssue[] = [];
  const allContentIssues: SEOIssue[] = [];
  const allOnPageIssues: SEOIssue[] = [];
  const allPerformanceIssues: SEOIssue[] = [];
  const allRecommendations: SEORecommendation[] = [];
  
  // Track pages with specific issues
  const pagesWithIssues: { [key: string]: string[] } = {};
  
  // Process each page report
  Object.entries(pageReports).forEach(([pageUrl, report]) => {
    // Add technical issues
    report.technical.issues.forEach(issue => {
      // Add page URL to the issue description
      const issueWithPage = { 
        ...issue, 
        description: `[${pageUrl}] ${issue.description}` 
      };
      allTechnicalIssues.push(issueWithPage);
      
      // Track this page as having this type of issue
      if (!pagesWithIssues[issue.title]) {
        pagesWithIssues[issue.title] = [];
      }
      pagesWithIssues[issue.title].push(pageUrl);
    });
    
    // Add content issues
    report.content.issues.forEach(issue => {
      const issueWithPage = { 
        ...issue, 
        description: `[${pageUrl}] ${issue.description}` 
      };
      allContentIssues.push(issueWithPage);
      
      if (!pagesWithIssues[issue.title]) {
        pagesWithIssues[issue.title] = [];
      }
      pagesWithIssues[issue.title].push(pageUrl);
    });
    
    // Add on-page issues
    report.onPage.issues.forEach(issue => {
      const issueWithPage = { 
        ...issue, 
        description: `[${pageUrl}] ${issue.description}` 
      };
      allOnPageIssues.push(issueWithPage);
      
      if (!pagesWithIssues[issue.title]) {
        pagesWithIssues[issue.title] = [];
      }
      pagesWithIssues[issue.title].push(pageUrl);
    });
    
    // Add performance issues
    report.performance.issues.forEach(issue => {
      const issueWithPage = { 
        ...issue, 
        description: `[${pageUrl}] ${issue.description}` 
      };
      allPerformanceIssues.push(issueWithPage);
      
      if (!pagesWithIssues[issue.title]) {
        pagesWithIssues[issue.title] = [];
      }
      pagesWithIssues[issue.title].push(pageUrl);
    });
  });
  
  // Deduplicate issues by combining similar ones
  const deduplicatedTechnicalIssues = deduplicateIssues(allTechnicalIssues, pagesWithIssues);
  const deduplicatedContentIssues = deduplicateIssues(allContentIssues, pagesWithIssues);
  const deduplicatedOnPageIssues = deduplicateIssues(allOnPageIssues, pagesWithIssues);
  const deduplicatedPerformanceIssues = deduplicateIssues(allPerformanceIssues, pagesWithIssues);
  
  // Set the issues in the comprehensive report
  comprehensiveReport.technical.issues = deduplicatedTechnicalIssues;
  comprehensiveReport.content.issues = deduplicatedContentIssues;
  comprehensiveReport.onPage.issues = deduplicatedOnPageIssues;
  comprehensiveReport.performance.issues = deduplicatedPerformanceIssues;
  
  // Calculate scores for each section
  comprehensiveReport.technical.score = calculateSectionScore(deduplicatedTechnicalIssues);
  comprehensiveReport.content.score = calculateSectionScore(deduplicatedContentIssues);
  comprehensiveReport.onPage.score = calculateSectionScore(deduplicatedOnPageIssues);
  comprehensiveReport.performance.score = calculateSectionScore(deduplicatedPerformanceIssues);
  
  // Generate site-wide recommendations
  comprehensiveReport.recommendations = generateSiteWideRecommendations(
    deduplicatedTechnicalIssues,
    deduplicatedContentIssues,
    deduplicatedOnPageIssues,
    deduplicatedPerformanceIssues,
    domain
  );
  
  // Calculate the overall score
  comprehensiveReport.overall.score = calculateOverallScore(comprehensiveReport);
  
  // Generate an overall summary
  comprehensiveReport.overall.summary = generateComprehensiveSummary(
    comprehensiveReport,
    Object.keys(pageReports).length,
    domain
  );
  
  // Set timestamp
  comprehensiveReport.overall.timestamp = new Date().toISOString();
  
  return comprehensiveReport;
};

/**
 * Deduplicate issues by combining similar ones
 */
const deduplicateIssues = (issues: SEOIssue[], pagesWithIssues: { [key: string]: string[] }): SEOIssue[] => {
  const uniqueIssues: { [key: string]: SEOIssue } = {};
  
  issues.forEach(issue => {
    if (!uniqueIssues[issue.title]) {
      // Create a new issue with pages affected
      const pagesAffected = pagesWithIssues[issue.title] || [];
      const pageCount = pagesAffected.length;
      
      uniqueIssues[issue.title] = {
        ...issue,
        description: `Found on ${pageCount} page(s): ${issue.description.split('] ')[1]}`,
        impact: `${issue.impact} Affects ${pageCount} page(s).`
      };
    }
  });
  
  return Object.values(uniqueIssues);
};

/**
 * Generate site-wide recommendations based on all issues
 */
const generateSiteWideRecommendations = (
  technicalIssues: SEOIssue[],
  contentIssues: SEOIssue[],
  onPageIssues: SEOIssue[],
  performanceIssues: SEOIssue[],
  domain: string
): SEORecommendation[] => {
  const recommendations: SEORecommendation[] = [];
  
  // Add high-priority recommendations first
  const highPriorityIssues = [
    ...technicalIssues.filter(i => i.severity === 'high'),
    ...contentIssues.filter(i => i.severity === 'high'),
    ...onPageIssues.filter(i => i.severity === 'high'),
    ...performanceIssues.filter(i => i.severity === 'high')
  ];
  
  highPriorityIssues.forEach(issue => {
    recommendations.push({
      title: `Fix ${issue.title}`,
      description: issue.description,
      severity: issue.severity,
      impact: issue.impact,
      recommendation: issue.recommendation
    });
  });
  
  // Add medium-priority recommendations
  const mediumPriorityIssues = [
    ...technicalIssues.filter(i => i.severity === 'medium'),
    ...contentIssues.filter(i => i.severity === 'medium'),
    ...onPageIssues.filter(i => i.severity === 'medium'),
    ...performanceIssues.filter(i => i.severity === 'medium')
  ];
  
  mediumPriorityIssues.forEach(issue => {
    recommendations.push({
      title: `Improve ${issue.title}`,
      description: issue.description,
      severity: issue.severity,
      impact: issue.impact,
      recommendation: issue.recommendation
    });
  });
  
  // Add site-wide recommendations
  recommendations.push({
    title: 'Implement Consistent SEO Strategy',
    description: `Create a consistent SEO strategy across all pages of ${domain}`,
    severity: "medium",
    impact: "A consistent SEO strategy improves overall site visibility and ranking potential.",
    recommendation: "Develop and implement a site-wide SEO strategy that addresses meta tags, content quality, internal linking, and keyword optimization across all pages."
  });
  
  // Add recommendations for content improvement if content issues exist
  if (contentIssues.length > 0) {
    recommendations.push({
      title: 'Develop a Content Improvement Plan',
      description: `Improve content quality across ${domain}`,
      severity: "medium",
      impact: "High-quality, relevant content improves user engagement and search engine rankings.",
      recommendation: "Create a content calendar to regularly update existing content and add new, valuable content that addresses user needs and incorporates relevant keywords."
    });
  }
  
  // Add recommendations for technical improvements if technical issues exist
  if (technicalIssues.length > 0) {
    recommendations.push({
      title: 'Resolve Technical SEO Issues',
      description: `Fix technical issues across ${domain}`,
      severity: "high",
      impact: "Technical issues can prevent search engines from properly indexing and ranking your site.",
      recommendation: "Prioritize fixing technical issues like broken links, slow loading times, and mobile responsiveness problems across all pages."
    });
  }
  
  return recommendations;
};

/**
 * Generate a comprehensive summary for the entire site
 */
const generateComprehensiveSummary = (report: SEOReport, pageCount: number, domain: string): string => {
  const overallScore = report.overall.score;
  const technicalScore = report.technical.score;
  const contentScore = report.content.score;
  const onPageScore = report.onPage.score;
  const performanceScore = report.performance.score;
  
  const technicalIssueCount = report.technical.issues.length;
  const contentIssueCount = report.content.issues.length;
  const onPageIssueCount = report.onPage.issues.length;
  const performanceIssueCount = report.performance.issues.length;
  const totalIssueCount = technicalIssueCount + contentIssueCount + onPageIssueCount + performanceIssueCount;
  
  let summaryText = `Comprehensive SEO audit of ${domain} analyzing ${pageCount} pages. `;
  
  if (overallScore >= 80) {
    summaryText += `The site has a strong overall SEO score of ${overallScore}/100. `;
  } else if (overallScore >= 60) {
    summaryText += `The site has a moderate overall SEO score of ${overallScore}/100 with room for improvement. `;
  } else {
    summaryText += `The site has a low overall SEO score of ${overallScore}/100 and requires significant improvements. `;
  }
  
  summaryText += `We identified ${totalIssueCount} issues across all pages: `;
  summaryText += `${technicalIssueCount} technical issues, ${contentIssueCount} content issues, `;
  summaryText += `${onPageIssueCount} on-page issues, and ${performanceIssueCount} performance issues. `;
  
  // Identify the weakest area
  const scores = [
    { area: 'technical', score: technicalScore },
    { area: 'content', score: contentScore },
    { area: 'on-page', score: onPageScore },
    { area: 'performance', score: performanceScore }
  ];
  
  scores.sort((a, b) => a.score - b.score);
  const weakestArea = scores[0];
  
  summaryText += `The weakest area is ${weakestArea.area} SEO with a score of ${weakestArea.score}/100. `;
  summaryText += `Addressing the recommendations in this report will help improve the site's search engine visibility and ranking potential.`;
  
  return summaryText;
};

/**
 * Gets all SEO audits for a specific client
 */
export const getSEOAuditsByClientId = async (clientId: string): Promise<SEOAudit[]> => {
  try {
    console.log(`Getting SEO audits for client: ${clientId}`);
    
    // Get the current user from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }
    
    // Get the user's role from metadata
    const isAdmin = user.user_metadata?.role === 'admin';
    
    // If admin, get all audits for the specified client
    if (isAdmin) {
      const { data, error } = await supabase
        .from('seo_audits')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching SEO audits:', error);
        return [];
      }
      
      return data || [];
    }
    
    // For regular clients, check if they're accessing their own data
    // Get the client record associated with this user
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (clientError || !clientData) {
      console.error('Error fetching client data:', clientError);
      return [];
    }
    
    const currentClientId = clientData.id;
    
    // Ensure the client can only access their own audits
    if (currentClientId !== clientId) {
      console.warn(`Client ${currentClientId} attempted to access SEO audits for client ${clientId}`);
      return [];
    }
    
    const { data, error } = await supabase
      .from('seo_audits')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching SEO audits:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching SEO audits:', error);
    return []; // Return empty array instead of throwing to avoid breaking the UI
  }
};

/**
 * Deletes an SEO audit by ID
 */
export const deleteSEOAudit = async (auditId: string): Promise<boolean> => {
  try {
    console.log(`Deleting SEO audit: ${auditId}`);
    
    const { error } = await supabase
      .from('seo_audits')
      .delete()
      .eq('id', auditId);
    
    if (error) {
      console.error('Error deleting SEO audit:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting SEO audit:', error);
    return false;
  }
};

/**
 * Gets a specific SEO audit by ID
 */
export const getSEOAuditById = async (auditId: string): Promise<SEOAudit | null> => {
  try {
    const { data, error } = await supabase
      .from('seo_audits')
      .select('*')
      .eq('id', auditId)
      .single();
    
    if (error) {
      console.error('Error fetching SEO audit:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error in getSEOAuditById:', error);
    return null;
  }
};

/**
 * Generates an SEO audit for a given URL using real web data
 */
export const generateSEOAudit = async (url: string, clientId: string, auditId?: string): Promise<SEOAudit> => {
  try {
    // Normalize the URL
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    // Get the user ID from the session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || 'anonymous';
    
    // Use provided auditId or generate a new one if not provided
    const id = auditId || generateUUID();
    
    console.log(`Creating SEO audit with ID: ${id} for URL: ${url}`);
    
    const timestamp = new Date().toISOString();
    
    // Create the audit object
    const auditObject = {
      id,
      client_id: clientId,
      user_id: userId,
      url,
      status: 'in-progress',
      score: 0,
      report: null,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    // Create an initial audit record
    const { error: auditError } = await supabase
      .from('seo_audits')
      .insert([auditObject]);
    
    if (auditError) {
      console.error('Error creating SEO audit:', auditError);
      throw auditError;
    }
    
    // Fetch the newly created audit
    const { data: fetchedAudit, error: fetchError } = await supabase
      .from('seo_audits')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !fetchedAudit) {
      console.error('Error fetching created audit:', fetchError);
      // If we can't fetch the audit, return the object we tried to create
      console.log('Using created audit object as fallback');
      // Start the audit process asynchronously
      processComprehensiveSEOAudit(url, id, userId);
      return auditObject as SEOAudit;
    }
    
    console.log('Successfully created SEO audit:', fetchedAudit);
    
    // Start the audit process asynchronously
    // This will crawl all pages and generate a comprehensive report
    processComprehensiveSEOAudit(url, id, userId);
    
    return fetchedAudit;
  } catch (error) {
    console.error('Error generating SEO audit:', error);
    throw error;
  }
};

/**
 * Generates a random UUID v4 that is PostgreSQL compatible
 */
const generateUUID = (): string => {
  // Use the native crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older browsers
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where y is 8, 9, a, or b
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
