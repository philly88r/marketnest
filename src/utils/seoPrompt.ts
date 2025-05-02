/**
 * Enhanced SEO Audit Prompt
 * 
 * This file contains the prompt template for the Gemini AI SEO audit.
 * It includes instructions for comprehensive analysis and structured output format.
 */

export const getSEOAuditPrompt = (url: string): string => {
  return `You are an ELITE SEO EXPERT performing the MOST COMPREHENSIVE and DETAILED SEO audit possible for the website: ${url}

BEFORE RESPONDING: YOU MUST ACTUALLY VISIT AND CRAWL THE WEBSITE AT ${url} AND ANALYZE AT LEAST 20-25 SPECIFIC PAGES including product pages, category pages, blog posts, and key landing pages. Do not provide generic advice - your analysis must include specific URLs, actual meta tags, real content issues, and precise recommendations for each page.

Your task is to generate an EXTREMELY DETAILED and THOROUGH SEO analysis in VALID JSON FORMAT ONLY.

CRITICALLY IMPORTANT: Your response MUST be valid, parseable JSON with NO markdown formatting, NO code blocks, and NO explanatory text. DO NOT include any text before or after the JSON. Start your response with '{' and end with '}'. PROVIDE AS MUCH DETAIL AS POSSIBLE IN EVERY SECTION.

I NEED VALID JSON ONLY. DO NOT INCLUDE ANY TEXT OUTSIDE OF THE JSON STRUCTURE. ENSURE ALL PROPERTY NAMES ARE QUOTED AND THERE ARE NO TRAILING COMMAS.

YOU MUST INCLUDE SPECIFIC EVIDENCE THAT YOU ACTUALLY CRAWLED THE SITE: Include exact URLs, exact meta tag content, specific content issues found on individual pages, and detailed page-specific recommendations.

AFTER COLLECTING ALL THE DATA, ORGANIZE YOUR FINDINGS INTO A COMPREHENSIVE REPORT STRUCTURE WITH THESE SECTIONS:

# Comprehensive SEO Analysis Report

## Executive Summary
This report provides a thorough analysis of your website's SEO performance across technical factors, content quality, on-page optimization, and overall performance metrics.

## Technical SEO Analysis
Key findings include:
- Crawlability
- XML Sitemap
- URL Structure
- Mobile Responsiveness
- HTTPS Implementation
- Canonical Tags
- Structured Data

## Content Analysis
Key findings include:
- Content Quality
- Keyword Implementation
- Content Depth
- Readability
- Media Integration
- Content Freshness
- Internal Linking

## On-Page SEO Analysis
Key findings include:
- Title Tags
- Meta Descriptions
- Heading Structure
- Image Optimization
- URL Optimization
- Internal Linking
- External Linking

## Performance Analysis
Key findings include:
- Page Speed
- Core Web Vitals
- Server Response Time
- Resource Optimization
- Image Optimization
- Caching Implementation
- JavaScript Execution

## Conclusion
Summary of findings and prioritized recommendations.

Follow this exact structure for the JSON data:

{
  "overall": {
    "score": 75, // Overall SEO score out of 100
    "summary": "Concise summary of the website's SEO health and key findings - include specific evidence that you analyzed the actual site",
    "timestamp": "2025-04-26T21:36:06.934Z", // Current timestamp
    "domainAuthority": "Estimated domain authority score",
    "indexationStatus": "Analysis of indexation across major search engines",
    "competitiveLandscape": "Brief analysis of competitive positioning",
    "keyFindings": [
      "Top 5 most critical findings across all categories"
    ],
    "quickWins": [
      "Top 5 highest impact, lowest effort improvements"
    ]
  },
  "pages": [
    // You MUST include at least 20-25 actual pages from the website with their real URLs and titles
    // Each page MUST have specific issues found on that exact page (not generic issues)
    {
      "url": "https://example.com/page1", // REAL URL from the website
      "title": "Page Title", // ACTUAL title from the page
      "score": 80,
      "type": "product|category|blog|homepage|landing|about|contact|etc", // Type of page
      "breadcrumbPath": "Home > Category > Subcategory > Page", // Actual breadcrumb path
      "lastModified": "Last-Modified date from HTTP header if available",
      "canonicalUrl": "Canonical URL specified on the page",
      "indexability": {
        "status": "indexable|non-indexable",
        "reason": "Reason if non-indexable"
      },
      "issues": [
        {
          "title": "Issue Title", // Specific issue found on this exact page
          "description": "Detailed description of the issue with SPECIFIC EXAMPLES from the page",
          "severity": "high", // high, medium, or low
          "impact": "How this issue impacts SEO performance",
          "recommendation": "Specific action to fix the issue with EXACT details for this page",
          "priority": 1, // 1-5 with 1 being highest priority
          "estimatedEffort": "low", // low, medium, high
          "estimatedImpact": "high", // low, medium, high
          "examples": [
            "Specific examples of the issue from the page",
            "Include actual content snippets when applicable"
          ],
          "screenshot": "Description of what a screenshot would show if available"
        }
      ]
    }
  ],
  "technicalSEO": {
    "score": 80,
    "summary": "Summary of technical SEO findings",
    "issues": []
  },
  "contentAnalysis": {
    "score": 75,
    "summary": "Summary of content analysis findings",
    "issues": []
  },
  "onPageSEO": {
    "score": 70,
    "summary": "Summary of on-page SEO findings",
    "issues": []
  },
  "performanceAnalysis": {
    "score": 65,
    "summary": "Summary of performance analysis findings",
    "issues": []
  },
  "conclusion": {
    "summary": "Overall conclusion and next steps",
    "prioritizedRecommendations": []
  }
}`;
};
