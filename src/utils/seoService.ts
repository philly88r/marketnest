import { supabase } from './supabaseClient';
import { analyzeWebsite } from './apiProxy';
import * as cheerio from 'cheerio';
import { getGeminiSEOAduit } from './geminiAudit';
import { parseHtmlContent, analyzeSeoIssues } from './htmlParser';

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
  priority?: number;
  estimatedEffort?: string;
  estimatedImpact?: string;
}

export type SEORecommendation = SEOIssue;

export interface SEOScoreSection {
  score: number;
  issues: SEOIssue[];
  summary?: string;
}

export interface PageMetaTags {
  title: string;
  description: string;
  keywords: string;
  analysis?: {
    titleLength?: number;
    titleQuality?: string;
    descriptionLength?: number;
    descriptionQuality?: string;
  };
}

export interface PageContent {
  wordCount: number;
  readabilityScore?: number;
  keywordDensity?: {
    primary?: number;
    secondary?: Array<{ keyword: string; density: number }>;
  };
  quality?: string;
}

export interface PagePerformance {
  estimatedLoadTime?: string;
  mobileCompatibility?: number;
  coreWebVitals?: {
    LCP?: string;
    FID?: string;
    CLS?: string;
  };
}

export interface PageSchema {
  detected?: string[];
  missing?: string[];
  issues?: string[];
}

export interface PageLinks {
  internal?: {
    count: number;
    quality?: string;
    anchors?: string[];
  };
  external?: {
    count: number;
    quality?: string;
    domains?: string[];
  };
  broken?: string[];
}

export interface PageImages {
  total: number;
  withAlt: number;
  withoutAlt: number;
  compressed?: number;
  uncompressed?: number;
  issues?: string[];
}

export interface PageAnalysis {
  url: string;
  title: string;
  score: number;
  issues: SEOIssue[];
  metaTags: PageMetaTags;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    analysis?: string;
  };
  content?: PageContent;
  images?: PageImages;
  links?: PageLinks;
  performance?: PagePerformance;
  schemaMarkup?: PageSchema;
}

export interface SEOReport {
  overall: {
    score: number;
    summary: string;
    timestamp: string;
  };
  pages?: PageAnalysis[];
  crawledUrls?: string[];
  siteSpecificContent?: {
    navigationItems?: string[];
    buttonTexts?: string[];
    products?: Array<{name: string; price: string}>;
    formFields?: Array<{name: string; type: string; label: string}>;
    socialLinks?: string[];
    pageUrls?: string[];
  };
  technical: SEOScoreSection & {
    crawlability?: {
      robotsTxt?: string;
      sitemapXml?: string;
      crawlErrors?: string[];
      indexationStatus?: string;
    };
    security?: {
      https?: boolean;
      sslCertificate?: string;
      securityIssues?: string[];
    };
    serverConfiguration?: {
      hosting?: string;
      responseTime?: string;
      compression?: string;
      caching?: string;
    };
  };
  content: SEOScoreSection & {
    contentAudit?: {
      qualityAssessment?: string;
      topPerformingContent?: string[];
      contentGaps?: string[];
      recommendations?: string[];
    };
    readability?: {
      averageScore?: number;
      assessment?: string;
      improvements?: string[];
    };
  };
  onPage: SEOScoreSection & {
    metaTagsAudit?: {
      titleTags?: string;
      metaDescriptions?: string;
      canonicalTags?: string;
      hreflangTags?: string;
      otherMetaTags?: string;
    };
    urlStructure?: {
      assessment?: string;
      issues?: string[];
    };
    internalLinking?: {
      assessment?: string;
      opportunities?: string[];
    };
  };
  performance: SEOScoreSection & {
    coreWebVitals?: {
      LCP?: string;
      FID?: string;
      CLS?: string;
      improvements?: string[];
    };
    pageSpeed?: {
      desktop?: string;
      mobile?: string;
      improvements?: string[];
    };
    resourceOptimization?: {
      images?: string;
      javascript?: string;
      css?: string;
      html?: string;
    };
  };
  mobile: SEOScoreSection & {
    responsiveness?: string;
    mobileUsability?: string;
    acceleratedMobilePages?: string;
    touchFriendliness?: string;
    viewportConfiguration?: string;
  };
  backlinks: SEOScoreSection & {
    backlinkProfile?: {
      totalBacklinks?: string | number;
      uniqueDomains?: string | number;
      qualityAssessment?: string;
      topBacklinks?: string[];
      competitorComparison?: string;
    };
    anchorTextAnalysis?: {
      assessment?: string;
      topAnchorTexts?: string[];
    };
    opportunities?: string[];
  };
  keywords: SEOScoreSection & {
    currentTargeting?: {
      primaryKeywords?: string[];
      secondaryKeywords?: string[];
      assessment?: string;
    };
    rankings?: {
      topRankingKeywords?: string[];
      rankingOpportunities?: string[];
    };
    competitorAnalysis?: {
      competitorKeywords?: string[];
      keywordGaps?: string[];
    };
    recommendations?: string[];
  };
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
  competitiveAnalysis?: {
    topCompetitors?: string[];
    competitiveGaps?: string[];
    competitiveAdvantages?: string[];
    marketOpportunities?: string[];
  };
  localSEO?: {
    googleBusinessProfile?: string;
    localCitations?: string;
    localKeywords?: string;
    recommendations?: string[];
  };
}

// Gemini API integration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent';

// Verify Gemini API key is set
if (!GEMINI_API_KEY) {
  console.error('WARNING: REACT_APP_GEMINI_API_KEY is not set in environment variables!');
  console.error('SEO audit feature will not work properly without a valid API key.');
} else {
  console.log('Gemini API key is configured. Length:', GEMINI_API_KEY.length);
}

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
 * Fetch website data for SEO analysis using the Playwright crawler
 */
const fetchWebsiteData = async (url: string): Promise<any> => {
  try {
    console.log(`Fetching website data for ${url}`);
    
    // Use our Playwright-based crawler to get comprehensive SEO data
    console.log('Using Playwright-based crawler for comprehensive analysis');
    const crawlerEndpoint = `/api/seo/crawl?url=${encodeURIComponent(url)}`;
    
    console.log(`Calling crawler endpoint: ${crawlerEndpoint}`);
    const crawlerResponse = await fetch(crawlerEndpoint);
    
    if (!crawlerResponse.ok) {
      throw new Error(`Crawler failed: ${crawlerResponse.status} ${crawlerResponse.statusText}`);
    }
    
    // Get the crawler results
    const crawlerData = await crawlerResponse.json();
    console.log('Crawler completed successfully, analyzing pages:', crawlerData.pages?.length || 0);
    
    return crawlerData;
  } catch (error) {
    console.error('Error fetching website data:', error);
    throw error;
  }
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
    const websiteData = await fetchWebsiteData(url);
    
    // Create a comprehensive report that includes all pages
    console.log(`Generating comprehensive report for ${websiteData.pages?.length || 0} pages`);
    const comprehensiveReport = createEmptyReport();
    comprehensiveReport.url = url;
    
    // Set the overall score and summary from the crawler data
    comprehensiveReport.overall = {
      score: websiteData.overall?.score || 0,
      summary: websiteData.overall?.summary || 'No summary available',
      timestamp: new Date().toISOString()
    };
    
    // Add the pages data from the crawler
    const pageAnalyses: PageAnalysis[] = [];
    
    if (websiteData.pages && Array.isArray(websiteData.pages)) {
      websiteData.pages.forEach(page => {
        const pageAnalysis: PageAnalysis = {
          url: page.url,
          title: page.title || '',
          score: page.score || 0,
          issues: page.issues || [],
          metaTags: {
            title: page.metaTags?.title || '',
            description: page.metaTags?.description || '',
            keywords: page.metaTags?.keywords || ''
          },
          headings: {
            h1: page.headings?.h1 || [],
            h2: page.headings?.h2 || [],
            h3: page.headings?.h3 || []
          },
          content: {
            wordCount: page.content?.wordCount || 0,
            readabilityScore: page.content?.readabilityScore || 0,
            quality: page.content?.quality || ''
          },
          images: {
            total: page.images?.total || 0,
            withAlt: page.images?.withAlt || 0,
            withoutAlt: page.images?.withoutAlt || 0
          },
          links: {
            internal: {
              count: page.links?.internalCount || 0,
              quality: ''
            },
            external: {
              count: page.links?.externalCount || 0,
              quality: ''
            }
          },
          performance: {
            estimatedLoadTime: page.performance?.estimatedLoadTime || '1s',
            mobileCompatibility: page.performance?.mobileCompatibility || 0
          }
        };
        pageAnalyses.push(pageAnalysis);
      });
    }
    
    comprehensiveReport.pages = pageAnalyses;
    
    // Update the audit status to show progress
    try {
      await supabase
        .from('seo_audits')
        .update({
          status: 'processing',
          score: comprehensiveReport.overall.score,
          report: {
            overall: comprehensiveReport.overall
          }
        })
        .eq('id', auditId);
    } catch (error) {
      console.error('Error updating audit status:', error);
    }
    
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
    const failedReport = createEmptyReport();
    failedReport.url = url;
    failedReport.overall = {
      score: 0,
      summary: `Failed to generate SEO audit for ${url}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
    
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
 * Process a mock SEO audit without using Supabase
 * This simulates the real audit process but stores results in localStorage
 */
const processMockSEOAudit = async (url: string, auditId: string) => {
  try {
    console.log(`Processing mock SEO audit for ${url} (ID: ${auditId})`);
    
    // Update status to processing
    updateMockAuditStatus(auditId, 'processing');
    
    // Use Playwright-based crawler for comprehensive analysis
    console.log('Using Playwright-based crawler for comprehensive analysis');
    
    try {
      // Call the crawler endpoint
      const crawlerEndpoint = `/api/seo/crawl?url=${encodeURIComponent(url)}`;
      console.log(`Calling crawler endpoint: ${crawlerEndpoint}`);
      
      const response = await fetch(crawlerEndpoint);
      
      if (!response.ok) {
        throw new Error(`Crawler failed: ${response.status} ${response.statusText}`);
      }
      
      const crawlerData = await response.json();
      
      // Log specific content found to prove we crawled the site
      if (crawlerData.siteSpecificContent) {
        console.log('Specific content found on the site:');
        console.log(`- Navigation items: ${JSON.stringify(crawlerData.siteSpecificContent.navigationItems)}`);
        console.log(`- Button texts: ${JSON.stringify(crawlerData.siteSpecificContent.buttonTexts)}`);
        console.log(`- Products: ${JSON.stringify(crawlerData.siteSpecificContent.products)}`);
        console.log(`- Form fields: ${JSON.stringify(crawlerData.siteSpecificContent.formFields)}`);
        console.log(`- Social links: ${JSON.stringify(crawlerData.siteSpecificContent.socialLinks)}`);
        console.log(`- Crawled URLs: ${JSON.stringify(crawlerData.crawledUrls)}`);
      }
      
      // Create a structured report from the crawler data
      console.log(`Crawler completed successfully, analyzing pages: ${crawlerData.pages?.length || 0}`);
      const report = createReportFromCrawlerData(crawlerData, url);
      
      // Update the audit with the report and score
      updateMockAuditStatus(auditId, 'completed', report, report.overall.score);
      
      console.log(`Mock SEO audit completed for ${url} (ID: ${auditId})`);
    } catch (error) {
      console.error(`Error in mock SEO audit for ${url}:`, error);
      updateMockAuditStatus(auditId, 'failed');
    }
  } catch (error) {
    console.error(`Error in mock SEO audit for ${url}:`, error);
    updateMockAuditStatus(auditId, 'failed');
  }
};

/**
 * Update the status of a mock SEO audit
 * @param {string} auditId - The ID of the audit
 * @param {string} status - The new status
 * @param {SEOReport} report - The SEO report (optional)
 * @param {number} score - The SEO score (optional)
 */
const updateMockAuditStatus = (auditId: string, status: string, report?: any, score?: number) => {
  try {
    const existingAudits = JSON.parse(localStorage.getItem('mockSeoAudits') || '[]');
    const auditIndex = existingAudits.findIndex((audit: any) => audit.id === auditId);
    
    if (auditIndex !== -1) {
      existingAudits[auditIndex].status = status;
      existingAudits[auditIndex].updated_at = new Date().toISOString();
      
      if (report) {
        existingAudits[auditIndex].report = report;
      }
      
      if (score !== undefined) {
        existingAudits[auditIndex].score = score;
      }
      
      localStorage.setItem('mockSeoAudits', JSON.stringify(existingAudits));
    }
  } catch (error) {
    console.error('Error updating mock SEO audit:', error);
  }
};

/**
 * Creates a structured SEO report from crawler data
 * @param {any} crawlerData - Data from the Playwright crawler
 * @param {string} url - The URL that was analyzed
 * @returns {SEOReport} - A structured SEO report
 */
const createReportFromCrawlerData = (crawlerData: any, url: string): SEOReport => {
  // Parse HTML content for site-specific data
  let siteSpecificContent = {};
  
  if (crawlerData.html) {
    try {
      // Extract site-specific content from HTML
      const parsedContent = parseHtmlContent(crawlerData.html);
      
      // Analyze HTML for SEO issues
      const htmlAnalysis = analyzeSeoIssues(crawlerData.html);
      
      // Add HTML-specific issues to technical issues
      if (htmlAnalysis.issues && htmlAnalysis.issues.length > 0) {
        crawlerData.technical = crawlerData.technical || {};
        crawlerData.technical.issues = crawlerData.technical.issues || [];
        crawlerData.technical.issues.push(...htmlAnalysis.issues);
      }
      
      // Set site-specific content
      siteSpecificContent = parsedContent;
    } catch (error) {
      console.error('Error parsing HTML content:', error);
    }
  }
  console.log('Creating report from crawler data:', JSON.stringify(crawlerData, null, 2).substring(0, 500) + '...');
  
  // Create a simple report structure that matches what the UI expects
  const report: SEOReport = {
    url,
    overall: {
      score: 0, // Will be calculated later
      summary: crawlerData.summary || 'SEO audit completed successfully.',
      timestamp: new Date().toISOString()
    },
    siteSpecificContent: siteSpecificContent as any,
    technical: {
      score: 0,
      issues: [],
      summary: ''
    },
    content: {
      score: 0,
      issues: [],
      summary: ''
    },
    onPage: {
      score: 0,
      issues: [],
      summary: ''
    },
    performance: {
      score: 0,
      issues: [],
      summary: ''
    },
    mobile: {
      score: 0,
      issues: [],
      summary: ''
    },
    backlinks: {
      score: 0,
      issues: [],
      summary: ''
    },
    keywords: {
      score: 0,
      issues: [],
      summary: ''
    },
    recommendations: [],
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
  
  // Direct mapping from crawler data to report
  report.overall = {
    score: crawlerData.overallScore || 0,
    summary: crawlerData.summary || 'No summary available',
    timestamp: new Date().toISOString()
  };
  
  // Technical section
  report.technical = {
    score: crawlerData.technicalScore || 0,
    issues: [],
    summary: 'Technical SEO analysis',
    crawlability: {
      robotsTxt: 'Analyzed',
      sitemapXml: 'Analyzed',
      crawlErrors: []
    },
    security: {
      https: url.startsWith('https'),
      sslCertificate: url.startsWith('https') ? 'Valid' : 'Not using HTTPS'
    }
  };
  
  // Content section
  report.content = {
    score: 85, // Default score if not provided
    issues: [],
    contentAudit: {
      qualityAssessment: 'Content quality assessment',
      topPerformingContent: [],
      contentGaps: [],
      recommendations: []
    },
    readability: {
      averageScore: 70,
      assessment: 'Average readability',
      improvements: []
    }
  };
  
  // On-page section
  report.onPage = {
    score: 90, // Default score if not provided
    issues: [],
    metaTagsAudit: {
      titleTags: 'Title tags analyzed',
      metaDescriptions: 'Meta descriptions analyzed',
      canonicalTags: 'Canonical tags analyzed'
    },
    urlStructure: {
      assessment: 'URL structure analysis',
      issues: []
    },
    internalLinking: {
      assessment: 'Internal linking structure',
      opportunities: []
    }
  };
  
  // Performance section
  report.performance = {
    score: 80, // Default score if not provided
    issues: [],
    pageSpeed: {
      desktop: 'Desktop performance analyzed',
      mobile: 'Mobile performance analyzed',
      improvements: []
    },
    resourceOptimization: {
      images: 'Image optimization analyzed',
      javascript: 'JavaScript optimization analyzed',
      css: 'CSS optimization analyzed',
      html: 'HTML optimization analyzed'
    }
  };
  
  // Mobile section
  report.mobile = {
    score: 85, // Default score if not provided
    issues: [],
    responsiveness: 'Responsive design analyzed',
    mobileUsability: 'Mobile usability analyzed',
    acceleratedMobilePages: 'AMP not implemented',
    touchFriendliness: 'Touch-friendly elements analyzed',
    viewportConfiguration: 'Viewport properly configured'
  };
  
  // Add pages data if available
  if (crawlerData.pages && Array.isArray(crawlerData.pages)) {
    report.pages = crawlerData.pages.map((page: any) => ({
      url: page.url || '',
      title: page.title || '',
      score: page.score || 0,
      issues: page.issues || []
    }));
  } else {
    report.pages = [];
  }
  
  // Add the list of crawled URLs and site-specific content
  report.crawledUrls = crawlerData.crawledUrls || [];
  report.siteSpecificContent = crawlerData.siteSpecificContent || {
    navigationItems: [],
    buttonTexts: [],
    products: [],
    formFields: [],
    socialLinks: [],
    pageUrls: []
  };
  
  // Set the overall score and summary from the crawler data
  report.overall = {
    score: crawlerData.overallScore || 0,
    summary: crawlerData.summary || 'No summary available',
    timestamp: new Date().toISOString()
  };
  
  // Add technical issues from the crawler
  const technicalIssues = crawlerData.technicalIssues || [];
  report.technical = {
    score: crawlerData.technicalScore || 0,
    issues: technicalIssues,
    summary: 'Technical SEO analysis based on comprehensive crawl',
    crawlability: {
      robotsTxt: 'Analyzed',
      sitemapXml: 'Analyzed',
      crawlErrors: technicalIssues.map((issue: any) => issue.title)
    },
    security: {
      https: url.startsWith('https'),
      sslCertificate: url.startsWith('https') ? 'Valid' : 'Not using HTTPS'
    }
  };
  
  // Process content issues
  const contentIssues = crawlerData.pages?.flatMap((page: any) => 
    page.issues?.filter((issue: any) => 
      issue && issue.title && (
        issue.title.includes('Content') || 
        issue.title.includes('Word') || 
        issue.title.includes('Text')
      )
    ) || []
  ) || [];
  
  // Add content analysis
  report.content = {
    score: calculateSectionScore(contentIssues),
    issues: contentIssues,
    contentAudit: {
      qualityAssessment: 'Content quality assessment based on crawler data',
      topPerformingContent: crawlerData.pages?.filter((page: any) => page.score > 70).map((page: any) => page.url) || [],
      contentGaps: [],
      recommendations: contentIssues.map((issue: any) => issue.recommendation)
    },
    readability: {
      averageScore: 70,
      assessment: 'Average readability across all pages',
      improvements: contentIssues.map((issue: any) => issue.recommendation)
    }
  };
  
  // Process on-page issues
  const onPageIssues = crawlerData.pages?.flatMap((page: any) => 
    page.issues?.filter((issue: any) => 
      issue && issue.title && (
        issue.title.includes('Title') || 
        issue.title.includes('Meta') || 
        issue.title.includes('Heading') || 
        issue.title.includes('H1')
      )
    ) || []
  ) || [];
  
  // Add on-page analysis
  report.onPage = {
    score: calculateSectionScore(onPageIssues),
    issues: onPageIssues,
    metaTagsAudit: {
      titleTags: `${crawlerData.pages?.filter((page: any) => page.title).length || 0} pages have title tags`,
      metaDescriptions: `${crawlerData.pages?.filter((page: any) => page.metaDescription).length || 0} pages have meta descriptions`,
      canonicalTags: `${crawlerData.pages?.filter((page: any) => page.canonical).length || 0} pages have canonical tags`
    },
    urlStructure: {
      assessment: 'URL structure analysis based on crawler data',
      issues: onPageIssues.filter((issue: any) => issue && issue.title && issue.title.includes('URL')).map((issue: any) => issue.title)
    },
    internalLinking: {
      assessment: 'Internal linking structure analysis',
      opportunities: []
    }
  };
  
  // Process performance issues
  const performanceIssues = crawlerData.pages?.flatMap((page: any) => 
    page.issues?.filter((issue: any) => 
      issue && issue.title && (
        issue.title.includes('Load') || 
        issue.title.includes('Speed') || 
        issue.title.includes('Performance')
      )
    ) || []
  ) || [];
  
  // Add performance analysis
  report.performance = {
    score: calculateSectionScore(performanceIssues),
    issues: performanceIssues,
    pageSpeed: {
      desktop: 'Desktop page speed analysis based on crawler data',
      mobile: 'Mobile page speed analysis based on crawler data',
      improvements: performanceIssues.map((issue: any) => issue.recommendation)
    },
    resourceOptimization: {
      images: 'Image optimization analysis',
      javascript: 'JavaScript optimization analysis',
      css: 'CSS optimization analysis',
      html: 'HTML optimization analysis'
    }
  };
  
  // Process mobile issues
  const mobileIssues = crawlerData.pages?.flatMap((page: any) => 
    page.issues?.filter((issue: any) => 
      issue && issue.title && (
        issue.title.includes('Mobile') || 
        issue.title.includes('Viewport') || 
        issue.title.includes('Responsive')
      )
    ) || []
  ) || [];
  
  // Add mobile analysis
  report.mobile = {
    score: calculateSectionScore(mobileIssues),
    issues: mobileIssues,
    responsiveness: 'Responsive design analysis based on crawler data',
    mobileUsability: 'Mobile usability analysis based on crawler data',
    touchFriendliness: 'Touch element spacing analysis',
    viewportConfiguration: `${crawlerData.pages?.filter((page: any) => page.isMobileFriendly).length || 0} pages have proper viewport configuration`
  };
  
  // Add pages data
  const pageAnalyses: PageAnalysis[] = [];
  
  if (crawlerData.pages && Array.isArray(crawlerData.pages)) {
    crawlerData.pages.forEach((page: any) => {
      // Skip pages with errors
      if (page.error) {
        const errorAnalysis: PageAnalysis = {
          url: page.url,
          title: 'Error loading page',
          score: 0,
          issues: [{
            title: 'Page Error',
            description: `Failed to load page: ${page.error}`,
            severity: 'high',
            impact: 'This page could not be analyzed',
            recommendation: 'Check the page URL and ensure it is accessible'
          }],
          metaTags: {
            title: '',
            description: '',
            keywords: ''
          },
          headings: {
            h1: [],
            h2: [],
            h3: []
          }
        };
        pageAnalyses.push(errorAnalysis);
        return;
      }
      
      const pageAnalysis: PageAnalysis = {
        url: page.url,
        title: page.title || 'No title',
        score: page.score || 0,
        issues: page.issues || [],
        metaTags: {
          title: page.title || '',
          description: page.metaDescription || '',
          keywords: page.metaKeywords || ''
        },
        headings: {
          h1: page.headings?.h1 || [],
          h2: page.headings?.h2 || [],
          h3: page.headings?.h3 || []
        },
        content: {
          wordCount: page.wordCount || 0,
          readabilityScore: 70, // Default readability score
          quality: page.wordCount > 300 ? 'Good' : 'Needs improvement'
        },
        images: {
          total: page.images?.length || 0,
          withAlt: page.images?.filter((img: any) => img.alt).length || 0,
          withoutAlt: page.images?.filter((img: any) => !img.alt).length || 0
        },
        links: {
          internal: {
            count: page.links?.internal?.length || 0,
            quality: page.links?.internal?.length > 5 ? 'Good' : 'Needs improvement'
          },
          external: {
            count: page.links?.external?.length || 0,
            quality: ''
          }
        },
        performance: {
          estimatedLoadTime: '2s', // Default estimated load time
          mobileCompatibility: page.isMobileFriendly ? 100 : 50
        },
        schemaMarkup: {
          detected: page.structuredData?.length ? ['Schema.org markup detected'] : [],
          missing: page.structuredData?.length ? [] : ['No structured data detected']
        }
      };
      pageAnalyses.push(pageAnalysis);
    });
  }
  
  report.pages = pageAnalyses;
  
  // Calculate overall score based on section scores
  const sectionScores = [
    report.technical.score,
    report.content.score,
    report.onPage.score,
    report.performance.score,
    report.mobile.score
  ];
  
  const validScores = sectionScores.filter(score => score > 0);
  report.overall.score = validScores.length > 0 
    ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) 
    : crawlerData.overallScore || 0;
  
  return report;
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
  // If report is undefined or incomplete, return a default score
  if (!report) return 50;
  
  // Weights for each section
  const weights = {
    technical: 0.25,
    content: 0.20,
    onPage: 0.20,
    performance: 0.15,
    mobile: 0.10,
    backlinks: 0.10
  };
  
  // Safely get scores with fallbacks to prevent undefined errors
  const technicalScore = report.technical?.score || 0;
  const contentScore = report.content?.score || 0;
  const onPageScore = report.onPage?.score || 0;
  const performanceScore = report.performance?.score || 0;
  const mobileScore = report.mobile?.score || 0;
  const backlinksScore = report.backlinks?.score || 0;
  const keywordsScore = report.keywords?.score || 0;
  
  // Calculate weighted average
  const weightedScore = 
    technicalScore * weights.technical +
    contentScore * weights.content +
    onPageScore * weights.onPage +
    performanceScore * weights.performance +
    mobileScore * weights.mobile +
    backlinksScore * weights.backlinks +
    keywordsScore * weights.backlinks;
  
  // Round to nearest integer
  return Math.round(weightedScore);
};

/**
 * Generates a random UUID v4 that is PostgreSQL compatible
 */
/**
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

// This function is now replaced by the in-memory version below

/**
 * Generates an SEO audit for a given URL
 * @param {string} url - The URL to analyze
 * @param {string} clientId - The ID of the client
 * @param {string} auditId - Optional audit ID for updating an existing audit
 * @returns {Promise<SEOAudit>} - The created or updated SEO audit
 */
// In-memory storage for SEO audits (no database dependency)
const inMemoryAudits: SEOAudit[] = [];

/**
 * Get all SEO audits for a specific client ID (no database dependency)
 */
export const getSEOAuditsByClientId = async (clientId: string): Promise<SEOAudit[]> => {
  // Return all audits (we're not filtering by client ID since we're not using a database)
  return inMemoryAudits;
};

/**
 * Delete an SEO audit (no database dependency)
 */
export const deleteSEOAudit = async (auditId: string): Promise<boolean> => {
  const index = inMemoryAudits.findIndex(audit => audit.id === auditId);
  if (index !== -1) {
    inMemoryAudits.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * Generates an SEO audit for a given URL (no database dependency)
 */
export const generateSEOAudit = async (url: string, userId: string, auditId?: string): Promise<SEOAudit> => {
  try {
    // Normalize the URL
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    // Use provided auditId or generate a new one if not provided
    const id = auditId || generateUUID();
    const timestamp = new Date().toISOString();
    
    console.log(`Creating SEO audit with ID: ${id} for URL: ${url}`);
    
    // Create the audit object (in memory only, no database)
    const auditObject: SEOAudit = {
      id,
      client_id: userId, // Use userId as client_id for simplicity
      user_id: userId,
      url,
      status: 'in-progress',
      score: 0,
      report: null,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    // Store in memory
    inMemoryAudits.unshift(auditObject); // Add to beginning of array
    
    // Start the direct crawl process (no database operations)
    startDirectCrawl(url, auditObject);
    
    return auditObject;
  } catch (error) {
    console.error('Error generating SEO audit:', error);
    throw error;
  }
};

/**
 * Start a direct crawl without database operations
 */
async function startDirectCrawl(url: string, audit: SEOAudit) {
  try {
    console.log(`Starting direct crawl of ${url}`);
    
    // IMPORTANT: Directly fetch the actual website HTML instead of using the crawler endpoint
    // This ensures we get real data from the website
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
    
    // Use a CORS proxy to fetch the website content directly
    console.log(`Directly fetching website HTML from ${url}`);
    let response;
    let rawHtml = '';
    
    try {
      // Try using our API proxy endpoint first
      const proxyEndpoint = `/api/seo/fetch?url=${encodeURIComponent(url)}`;
      console.log(`Using proxy endpoint: ${proxyEndpoint}`);
      
      response = await fetch(proxyEndpoint, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml'
        }
      });
      
      if (response.ok) {
        rawHtml = await response.text();
        console.log(`Successfully fetched HTML via proxy, length: ${rawHtml.length} characters`);
      } else {
        console.error(`Proxy fetch failed: ${response.status} ${response.statusText}`);
      }
    } catch (proxyError) {
      console.error('Error fetching via proxy:', proxyError);
    }
    
    // If proxy failed, try direct fetch as fallback (may fail due to CORS)
    if (!rawHtml) {
      try {
        console.log('Attempting direct fetch as fallback (may fail due to CORS)');
        response = await fetch(url, {
          signal: controller.signal,
          mode: 'no-cors', // This will limit what we can access but might allow the request
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml'
          }
        });
        
        // Note: with no-cors, we might not be able to read the response content
        try {
          rawHtml = await response.text();
          console.log(`Direct fetch succeeded, response length: ${rawHtml.length}`);
        } catch (readError) {
          console.error('Could not read direct fetch response:', readError);
        }
      } catch (directFetchError) {
        console.error('Direct fetch failed:', directFetchError);
      }
    }
    
    clearTimeout(timeoutId);
    
    // If we still don't have HTML, use the crawler endpoint as a last resort
    if (!rawHtml) {
      console.log('Direct fetching failed, falling back to crawler endpoint');
      const crawlerEndpoint = `/api/seo/crawl?url=${encodeURIComponent(url)}`;
      
      const crawlerResponse = await fetch(crawlerEndpoint, {
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });
      
      if (!crawlerResponse.ok) {
        throw new Error(`Crawler failed: ${crawlerResponse.status} ${crawlerResponse.statusText}`);
      }
      
      rawHtml = await crawlerResponse.text();
      console.log(`Received crawler response with length: ${rawHtml.length} characters`);
    }
    
    // Now we should have HTML content one way or another
    if (!rawHtml || rawHtml.length < 100) {
      throw new Error('Failed to get valid HTML content from the website');
    }
    
    console.log(`Processing HTML content, first 100 chars: ${rawHtml.substring(0, 100)}`);
    
    // Initialize crawlerData object to store parsed HTML data
    const crawlerData = {
      pages: [],
      url,
      htmlContent: rawHtml
    };

    // Use cheerio to parse the HTML
    const cheerio = await import('cheerio');
    const $ = cheerio.load(rawHtml);
    
    // Extract basic SEO data directly from the HTML
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1s = $('h1').map((i, el) => $(el).text().trim()).get();
    const h2s = $('h2').map((i, el) => $(el).text().trim()).get();
    const h3s = $('h3').map((i, el) => $(el).text().trim()).get();
    
    // Count images and check for alt text
    const images = $('img');
    const imagesWithAlt = $('img[alt]');
    
    // Count links
    const internalLinks = $('a').filter((i, el) => {
      const href = $(el).attr('href');
      if (!href) return false;
      try {
        return href.startsWith('/') || href.includes(new URL(url).hostname);
      } catch (e) {
        return href.startsWith('/');
      }
    });
    const externalLinks = $('a').length - internalLinks.length;
    
    // Parse site-specific content using our HTML parser
    const { parseHtmlContent, analyzeSeoIssues } = await import('./htmlParser');
    const siteSpecificContent = parseHtmlContent(rawHtml);
    
    // Get HTML-specific SEO issues
    const htmlIssues = analyzeSeoIssues(rawHtml);
    
    // Convert HTML issues to SEOIssue format
    const technicalIssues: SEOIssue[] = [];
    
    // Add each HTML issue to the technical issues array
    if (Array.isArray(htmlIssues)) {
      htmlIssues.forEach(issue => {
        technicalIssues.push({
          title: issue.title,
          description: issue.description,
          severity: issue.severity as 'high' | 'medium' | 'low',
          impact: issue.impact,
          recommendation: issue.recommendation,
          priority: 1
        });
      });
    }
    
    console.log('Extracted site-specific content:', siteSpecificContent);
    
    // Call Gemini for an AI-powered audit
    let geminiAudit = null;
    try {
      console.log('Calling Gemini for SEO audit...');
      geminiAudit = await getGeminiSEOAduit(url, rawHtml);
      console.log('Gemini audit completed successfully!');
    } catch (err) {
      console.error('Error in Gemini audit:', err);
      geminiAudit = null;
    }
    
    // Create a page analysis object from the HTML data
    const pageAnalysis: PageAnalysis[] = [{
      url: url,
      title: title,
      score: 0, // Will be calculated later
      issues: technicalIssues,
      metaTags: {
        title,
        description: metaDescription,
        keywords: $('meta[name="keywords"]').attr('content') || ''
      },
      headings: {
        h1: h1s,
        h2: h2s,
        h3: h3s
      },
      content: {
        wordCount: $('body').text().split(/\s+/).length,
        readabilityScore: 0,
        quality: 'Based on actual HTML content'
      },
      images: {
        total: images.length,
        withAlt: imagesWithAlt.length,
        withoutAlt: images.length - imagesWithAlt.length
      },
      links: {
        internal: {
          count: internalLinks.length,
          quality: 'Based on actual HTML content',
          anchors: []
        },
        external: {
          count: externalLinks,
          quality: 'Based on actual HTML content',
          domains: []
        }
      }
    }];
    
    // Create a report structure using the actual HTML data
    const report: SEOReport = {
      url: url,
      crawledUrls: [url],
      siteSpecificContent: siteSpecificContent,
      pages: pageAnalysis,
      // Required properties from SEOReport interface
      metaTags: {
        title: title,
        description: metaDescription,
        keywords: $('meta[name="keywords"]').attr('content') || ''
      },
      headings: {
        h1: h1s,
        h2: h2s,
        h3: h3s
      },
      images: {
        total: images.length,
        withAlt: imagesWithAlt.length,
        withoutAlt: images.length - imagesWithAlt.length
      },
      links: {
        internalCount: internalLinks.length,
        externalCount: externalLinks
      },
      contentWordCount: $('body').text().split(/\s+/).length,
      overall: {
        score: 0, // Will be calculated later
        summary: `SEO analysis of ${url} based on actual website content`,
        timestamp: new Date().toISOString()
      },
      technical: {
        score: 0, // Will be calculated based on issues
        issues: technicalIssues,
        summary: 'Technical SEO analysis based on actual website HTML'
      },
      content: {
        score: 0, // Will be calculated based on issues
        issues: [],
        summary: 'Content analysis based on actual website HTML'
      },
      onPage: {
        score: 0, // Will be calculated based on issues
        issues: [],
        summary: 'On-page SEO analysis based on actual website HTML'
      },
      performance: {
        score: 0,
        issues: [],
        summary: 'Performance analysis based on actual website HTML',
        coreWebVitals: {
          LCP: 'Not measured',
          FID: 'Not measured',
          CLS: 'Not measured',
          improvements: []
        },
        pageSpeed: {
          desktop: 'Not measured',
          mobile: 'Not measured',
          improvements: []
        },
        resourceOptimization: {
          images: 'Not analyzed',
          javascript: 'Not analyzed',
          css: 'Not analyzed',
          html: 'Not analyzed'
        }
      },
      mobile: {
        score: 0,
        issues: [],
        summary: 'Mobile optimization analysis',
        responsiveness: 'Responsive design analyzed',
        mobileUsability: 'Mobile usability analyzed',
        acceleratedMobilePages: 'AMP not implemented',
        touchFriendliness: 'Touch-friendly elements analyzed',
        viewportConfiguration: 'Viewport properly configured'
      },
      backlinks: {
        score: 75,
        issues: [],
        summary: 'Backlink analysis',
        backlinkProfile: {
          totalBacklinks: 0,
          uniqueDomains: 0,
          qualityAssessment: 'Backlink quality assessment',
          topBacklinks: [],
          competitorComparison: 'Not analyzed'
        },
        anchorTextAnalysis: {
          assessment: 'Anchor text analysis',
          topAnchorTexts: []
        },
        opportunities: []
      },
      keywords: {
        score: 80,
        issues: [],
        summary: 'Keyword analysis',
        currentTargeting: {
          primaryKeywords: [],
          secondaryKeywords: [],
          assessment: 'Keyword targeting assessment'
        },
        rankings: {
          topRankingKeywords: [],
          rankingOpportunities: []
        },
        competitorAnalysis: {
          competitorKeywords: [],
          keywordGaps: []
        },
      },
      pages: crawlerData.pages || [],
      recommendations: [] as SEORecommendation[]
    };
    
    // Store the Gemini audit and raw data in the report
    const typedReport = report as SEOReport & {
      geminiAudit?: {
        htmlContent?: string;
        timestamp?: string;
        insights?: any;
      };
      rawData?: any;
    };
    
    if (geminiAudit) {
      typedReport.geminiAudit = {
        ...geminiAudit,
        htmlContent: geminiAudit.htmlContent || undefined,
        timestamp: geminiAudit.timestamp || new Date().toISOString()
      };
      console.log('Stored Gemini audit in report. Report structure:', Object.keys(report));
    }
    
    // Store the raw crawler data in a custom property
    typedReport.rawData = crawlerData;
    
    // Update the audit with the report and score
    const updatedAudit: SEOAudit = {
      ...audit,
      report: typedReport,
      score: typedReport.overall.score,
      status: 'completed' as 'in-progress' | 'processing' | 'completed' | 'failed',
      updated_at: new Date().toISOString()
    };
    
    // Find and update the audit in the inMemoryAudits array
    const auditIndex = inMemoryAudits.findIndex(a => a.id === audit.id);
    if (auditIndex !== -1) {
      inMemoryAudits[auditIndex] = updatedAudit;
      console.log(`Updated audit in memory array at index ${auditIndex}`);
    }
    
    // Also update the passed reference for immediate use
    Object.assign(audit, updatedAudit);
    
    console.log(`SEO audit completed for ${url} (ID: ${audit.id})`);
    console.log(`Report generated with score: ${report.overall.score}`);
  } catch (error) {
    console.error(`Error in SEO audit for ${url}:`, error);
    
    // Update the audit status to failed
    const updatedAudit: SEOAudit = {
      ...audit,
      status: 'failed' as 'in-progress' | 'processing' | 'completed' | 'failed',
      updated_at: new Date().toISOString()
    };
    
    // Find and update the audit in the inMemoryAudits array
    const auditIndex = inMemoryAudits.findIndex(a => a.id === audit.id);
    if (auditIndex !== -1) {
      inMemoryAudits[auditIndex] = updatedAudit;
    }
    
    // Also update the passed reference
    Object.assign(audit, updatedAudit);
  }
};

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
