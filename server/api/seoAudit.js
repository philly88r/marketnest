const express = require('express');
const router = express.Router();

/**
 * Analyze a website's SEO based on the provided website data
 * This implements a comprehensive SEO audit covering all the factors mentioned
 */
router.post('/analyze', async (req, res) => {
  const { websiteData } = req.body;
  
  if (!websiteData) {
    return res.status(400).json({ error: 'Website data is required' });
  }
  
  try {
    console.log(`Analyzing SEO for: ${websiteData.url}`);
    
    // Initialize the SEO audit report
    const seoReport = {
      overall: {
        score: 0,
        summary: '',
        timestamp: new Date().toISOString()
      },
      pages: [
        {
          url: websiteData.url,
          title: websiteData.title,
          score: 0,
          issues: [],
          metaTags: {
            title: websiteData.title || '',
            description: websiteData.description || '',
            keywords: ''
          },
          headings: {
            h1: websiteData.headings?.h1s || [],
            h2: websiteData.headings?.h2s || [],
            h3: websiteData.headings?.h3s || []
          },
          content: {
            wordCount: websiteData.wordCount || 0
          },
          images: {
            total: websiteData.images?.length || 0,
            withAlt: websiteData.images?.filter(img => img.hasAlt).length || 0,
            withoutAlt: websiteData.images?.filter(img => !img.hasAlt).length || 0
          },
          links: {
            internal: {
              count: websiteData.links?.filter(link => !link.isExternal).length || 0,
              quality: 'Unknown'
            },
            external: {
              count: websiteData.links?.filter(link => link.isExternal).length || 0,
              quality: 'Unknown'
            }
          }
        }
      ],
      crawledUrls: [websiteData.url],
      technical: {
        score: 0,
        ssl: websiteData.technical?.ssl || false,
        mobileFriendly: websiteData.technical?.mobileFriendly || false,
        robotsTxt: websiteData.technical?.robotsTxt || false,
        sitemap: websiteData.technical?.sitemap || false,
        issues: [],
        crawlability: {
          robotsTxt: websiteData.technical?.robotsTxt ? 'Present' : 'Missing',
          sitemapXml: websiteData.technical?.sitemap ? 'Present' : 'Missing',
          crawlErrors: []
        },
        security: {
          https: websiteData.technical?.ssl || false
        }
      },
      onPage: {
        score: 0,
        issues: [],
        metaTagsAudit: {
          titleTags: 'Unknown',
          metaDescriptions: 'Unknown'
        }
      },
      content: {
        score: 0,
        issues: [],
        contentAudit: {
          qualityAssessment: 'Unknown',
          contentGaps: []
        },
        readability: {
          averageScore: 0,
          assessment: 'Unknown'
        }
      },
      performance: {
        score: 0,
        issues: [],
        coreWebVitals: {
          LCP: 'Unknown',
          FID: 'Unknown',
          CLS: 'Unknown'
        }
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
      recommendations: []
    };
    
    // Analyze technical SEO factors
    analyzeTechnicalSEO(seoReport, websiteData);
    
    // Analyze on-page SEO factors
    analyzeOnPageSEO(seoReport, websiteData);
    
    // Analyze content
    analyzeContent(seoReport, websiteData);
    
    // Analyze user experience
    analyzeUserExperience(seoReport, websiteData);
    
    // Generate recommendations
    generateRecommendations(seoReport);
    
    // Calculate overall score
    calculateOverallScore(seoReport);
    
    console.log('SEO analysis complete');
    res.json({ seoReport });
  } catch (error) {
    console.error('Error analyzing SEO:', error);
    res.status(500).json({ error: 'Failed to analyze SEO' });
  }
});

/**
 * Analyze technical SEO factors
 */
function analyzeTechnicalSEO(seoReport, websiteData) {
  const technical = seoReport.technical;
  const issues = technical.issues;
  let score = 0;
  let totalFactors = 0;
  
  // Check SSL/HTTPS
  if (technical.ssl) {
    score += 100;
  } else {
    issues.push({
      title: 'Missing SSL certificate',
      description: 'The website is not using HTTPS.',
      severity: 'high',
      impact: 'Significant impact on security and search rankings',
      recommendation: 'Install an SSL certificate and migrate to HTTPS.'
    });
  }
  totalFactors++;
  
  // Check robots.txt
  if (technical.robotsTxt) {
    score += 100;
  } else {
    issues.push({
      title: 'Missing robots.txt file',
      description: 'The website does not have a robots.txt file.',
      severity: 'medium',
      impact: 'May affect how search engines crawl the site',
      recommendation: 'Create a robots.txt file with appropriate directives.'
    });
  }
  totalFactors++;
  
  // Check sitemap
  if (technical.sitemap) {
    score += 100;
  } else {
    issues.push({
      title: 'Missing XML sitemap',
      description: 'The website does not have an XML sitemap.',
      severity: 'medium',
      impact: 'Reduced crawling efficiency for search engines',
      recommendation: 'Generate and submit an XML sitemap to search engines.'
    });
  }
  totalFactors++;
  
  // Check mobile-friendliness
  if (technical.mobileFriendly) {
    score += 100;
  } else {
    issues.push({
      title: 'Not mobile-friendly',
      description: 'The website is not optimized for mobile devices.',
      severity: 'high',
      impact: 'Poor user experience on mobile and lower search rankings',
      recommendation: 'Implement a responsive design or mobile-specific version.'
    });
  }
  totalFactors++;
  
  // Calculate technical score (average of all factors)
  technical.score = Math.round(totalFactors > 0 ? score / totalFactors : 0);
}

/**
 * Analyze on-page SEO factors
 */
function analyzeOnPageSEO(seoReport, websiteData) {
  const onPage = seoReport.onPage;
  const page = seoReport.pages[0];
  const issues = onPage.issues;
  let score = 0;
  let totalFactors = 0;
  
  // Check title tag
  if (page.metaTags.title) {
    const titleLength = page.metaTags.title.length;
    if (titleLength < 30 || titleLength > 60) {
      issues.push({
        title: 'Title tag length issue',
        description: `The title tag is ${titleLength < 30 ? 'too short' : 'too long'} (${titleLength} characters).`,
        severity: 'medium',
        impact: 'Suboptimal display in search results',
        recommendation: 'Optimize title length to be between 30-60 characters.'
      });
      score += 50;
    } else {
      score += 100;
    }
    onPage.metaTagsAudit.titleTags = titleLength < 30 ? 'Too short' : (titleLength > 60 ? 'Too long' : 'Good');
  } else {
    issues.push({
      title: 'Missing title tag',
      description: 'The page does not have a title tag.',
      severity: 'high',
      impact: 'Significant negative impact on SEO',
      recommendation: 'Add a descriptive title tag with target keywords.'
    });
    onPage.metaTagsAudit.titleTags = 'Missing';
  }
  totalFactors++;
  
  // Check meta description
  if (page.metaTags.description) {
    const descLength = page.metaTags.description.length;
    if (descLength < 120 || descLength > 158) {
      issues.push({
        title: 'Meta description length issue',
        description: `The meta description is ${descLength < 120 ? 'too short' : 'too long'} (${descLength} characters).`,
        severity: 'medium',
        impact: 'Suboptimal display in search results',
        recommendation: 'Optimize meta description length to be between 120-158 characters.'
      });
      score += 50;
    } else {
      score += 100;
    }
    onPage.metaTagsAudit.metaDescriptions = descLength < 120 ? 'Too short' : (descLength > 158 ? 'Too long' : 'Good');
  } else {
    issues.push({
      title: 'Missing meta description',
      description: 'The page does not have a meta description.',
      severity: 'medium',
      impact: 'Lower click-through rate from search results',
      recommendation: 'Add a compelling meta description with target keywords.'
    });
    onPage.metaTagsAudit.metaDescriptions = 'Missing';
  }
  totalFactors++;
  
  // Check H1 tag
  if (page.headings.h1 && page.headings.h1.length > 0) {
    if (page.headings.h1.length > 1) {
      issues.push({
        title: 'Multiple H1 tags',
        description: `The page has ${page.headings.h1.length} H1 tags.`,
        severity: 'medium',
        impact: 'Confusion for search engines about the main topic',
        recommendation: 'Use only one H1 tag per page.'
      });
      score += 50;
    } else {
      score += 100;
    }
  } else {
    issues.push({
      title: 'Missing H1 tag',
      description: 'The page does not have an H1 tag.',
      severity: 'high',
      impact: 'Search engines may not understand the main topic',
      recommendation: 'Add a descriptive H1 tag with target keywords.'
    });
  }
  totalFactors++;
  
  // Check image alt text
  if (page.images.total > 0) {
    const altTextPercentage = (page.images.withAlt / page.images.total) * 100;
    if (altTextPercentage < 100) {
      issues.push({
        title: 'Missing image alt text',
        description: `${page.images.withoutAlt} out of ${page.images.total} images are missing alt text.`,
        severity: 'medium',
        impact: 'Reduced accessibility and image SEO',
        recommendation: 'Add descriptive alt text to all images.'
      });
      score += Math.round(altTextPercentage);
    } else {
      score += 100;
    }
  }
  totalFactors++;
  
  // Check content length
  if (page.content.wordCount < 300) {
    issues.push({
      title: 'Thin content',
      description: `The page has only ${page.content.wordCount} words.`,
      severity: 'high',
      impact: 'May be considered low-quality by search engines',
      recommendation: 'Expand content to at least 300 words, ideally 500+.'
    });
    score += Math.min(100, Math.round((page.content.wordCount / 300) * 100));
  } else {
    score += 100;
  }
  totalFactors++;
  
  // Calculate on-page score (average of all factors)
  onPage.score = Math.round(totalFactors > 0 ? score / totalFactors : 0);
}

/**
 * Analyze content quality and structure
 */
function analyzeContent(seoReport, websiteData) {
  const content = seoReport.content;
  const issues = content.issues;
  let score = 0;
  let totalFactors = 0;
  
  // Check content length
  const wordCount = websiteData.wordCount || 0;
  if (wordCount < 300) {
    content.contentAudit.qualityAssessment = 'Thin content';
    issues.push({
      title: 'Low word count',
      description: `The page has only ${wordCount} words.`,
      severity: 'medium',
      impact: 'Reduced ability to rank for competitive keywords',
      recommendation: 'Expand the content to cover the topic more comprehensively.'
    });
    score += Math.min(100, Math.round((wordCount / 300) * 100));
  } else if (wordCount < 500) {
    content.contentAudit.qualityAssessment = 'Basic content';
    score += 70;
  } else if (wordCount < 1000) {
    content.contentAudit.qualityAssessment = 'Good content length';
    score += 85;
  } else {
    content.contentAudit.qualityAssessment = 'Comprehensive content';
    score += 100;
  }
  totalFactors++;
  
  // Check heading structure
  const headings = websiteData.headings || { h1s: [], h2s: [], h3s: [] };
  if (headings.h2s && headings.h2s.length > 0) {
    score += 100;
  } else {
    issues.push({
      title: 'Poor heading structure',
      description: 'The page lacks H2 headings for content organization.',
      severity: 'medium',
      impact: 'Reduced readability and SEO value',
      recommendation: 'Add H2 headings to structure your content logically.'
    });
  }
  totalFactors++;
  
  // Estimate readability (very basic estimation)
  let readabilityScore = 0;
  const text = websiteData.textContent || '';
  
  // Average sentence length (rough estimate)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? 
    Math.round(text.split(/\s+/).length / sentences.length) : 0;
  
  if (avgSentenceLength > 0) {
    // Shorter sentences are generally more readable
    if (avgSentenceLength < 15) {
      readabilityScore = 90;
      content.readability.assessment = 'Easy to read';
    } else if (avgSentenceLength < 20) {
      readabilityScore = 75;
      content.readability.assessment = 'Moderately readable';
    } else {
      readabilityScore = 60;
      content.readability.assessment = 'Difficult to read';
      issues.push({
        title: 'Long sentences',
        description: 'The content has long sentences that may be difficult to read.',
        severity: 'low',
        impact: 'Reduced readability and user engagement',
        recommendation: 'Break long sentences into shorter ones for better readability.'
      });
    }
  }
  
  content.readability.averageScore = readabilityScore;
  score += readabilityScore;
  totalFactors++;
  
  // Calculate content score (average of all factors)
  content.score = Math.round(totalFactors > 0 ? score / totalFactors : 0);
}

/**
 * Analyze user experience factors
 */
function analyzeUserExperience(seoReport, websiteData) {
  const mobile = seoReport.mobile;
  const performance = seoReport.performance;
  const issues = [...mobile.issues, ...performance.issues];
  
  // Check mobile-friendliness
  if (websiteData.technical && websiteData.technical.mobileFriendly) {
    mobile.score = 90;
  } else {
    mobile.score = 40;
    mobile.issues.push({
      title: 'Not mobile-friendly',
      description: 'The website is not optimized for mobile devices.',
      severity: 'high',
      impact: 'Poor user experience on mobile and lower search rankings',
      recommendation: 'Implement a responsive design or mobile-specific version.'
    });
  }
  
  // We can't actually measure performance metrics without real browser data
  // So we'll set some default values
  performance.score = 70;
  performance.coreWebVitals = {
    LCP: 'Unknown (requires real user data)',
    FID: 'Unknown (requires real user data)',
    CLS: 'Unknown (requires real user data)'
  };
}

/**
 * Generate recommendations based on the audit
 */
function generateRecommendations(seoReport) {
  const recommendations = [];
  
  // Collect all issues
  const allIssues = [
    ...seoReport.technical.issues,
    ...seoReport.onPage.issues,
    ...seoReport.content.issues,
    ...seoReport.mobile.issues,
    ...seoReport.performance.issues
  ];
  
  // Sort issues by severity
  const sortedIssues = allIssues.sort((a, b) => {
    const severityScore = { 'high': 3, 'medium': 2, 'low': 1 };
    return severityScore[b.severity] - severityScore[a.severity];
  });
  
  // Convert issues to recommendations
  sortedIssues.forEach(issue => {
    recommendations.push({
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      impact: issue.impact,
      recommendation: issue.recommendation
    });
  });
  
  // Add general recommendations if we don't have enough specific ones
  if (recommendations.length < 3) {
    if (!recommendations.some(r => r.title.includes('content'))) {
      recommendations.push({
        title: 'Improve content quality',
        description: 'The content could be more comprehensive and engaging.',
        severity: 'medium',
        impact: 'Better user engagement and search rankings',
        recommendation: 'Expand content with more detailed information, examples, and media.'
      });
    }
    
    if (!recommendations.some(r => r.title.includes('internal link'))) {
      recommendations.push({
        title: 'Improve internal linking',
        description: 'Better internal linking helps users and search engines navigate your site.',
        severity: 'medium',
        impact: 'Improved crawling and page authority distribution',
        recommendation: 'Add more contextual internal links to related content.'
      });
    }
  }
  
  seoReport.recommendations = recommendations;
}

/**
 * Calculate the overall SEO score
 */
function calculateOverallScore(seoReport) {
  // Weight each category
  const weights = {
    technical: 0.25,
    onPage: 0.25,
    content: 0.25,
    mobile: 0.15,
    performance: 0.10
  };
  
  // Calculate weighted score
  const overallScore = Math.round(
    (seoReport.technical.score * weights.technical) +
    (seoReport.onPage.score * weights.onPage) +
    (seoReport.content.score * weights.content) +
    (seoReport.mobile.score * weights.mobile) +
    (seoReport.performance.score * weights.performance)
  );
  
  seoReport.overall.score = overallScore;
  
  // Generate summary based on score
  if (overallScore >= 80) {
    seoReport.overall.summary = 'The website has good SEO practices but could be improved in several areas.';
  } else if (overallScore >= 60) {
    seoReport.overall.summary = 'The website has moderate SEO implementation with significant room for improvement.';
  } else {
    seoReport.overall.summary = 'The website has poor SEO implementation and requires substantial improvements.';
  }
  
  // Update page score to match overall
  seoReport.pages[0].score = overallScore;
}

module.exports = router;
