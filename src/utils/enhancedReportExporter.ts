/**
 * Enhanced Report Exporter
 * 
 * A streamlined utility to export SEO audit data to Google Docs format
 * with support for the comprehensive report structure.
 */

import { SEOAudit, SEOReport } from './seoService';

// Extended SEO Report interface with Gemini properties
interface ExtendedSEOReport extends SEOReport {
  geminiAudit?: {
    rawResponse?: string;
    htmlContent?: string;
    data?: any;
  };
  timestamp?: string;
}

/**
 * Export SEO audit to Google Docs with enhanced formatting
 * @param audit SEO audit to export
 * @returns URL to open in Google Docs
 */
export const exportToGoogleDocs = (audit: SEOAudit): string => {
  if (!audit || !audit.report) {
    throw new Error('No audit data available to export');
  }

  // Generate HTML content
  const htmlContent = generateReportHtml(audit);
  
  // Create Google Docs URL
  return `https://docs.google.com/document/create?usp=openurl&html=${encodeURIComponent(htmlContent)}`;
};

/**
 * Generate HTML report from SEO audit data
 * @param audit SEO audit data
 * @returns Formatted HTML content
 */
function generateReportHtml(audit: SEOAudit): string {
  const report = audit.report as ExtendedSEOReport;
  const rawData = report.geminiAudit?.rawResponse || report.geminiAudit?.htmlContent || '';
  
  // Extract JSON data if available
  let jsonData = null;
  try {
    if (rawData.includes('```json')) {
      const match = rawData.match(/```json\s*([\s\S]+?)```/);
      if (match && match[1]) {
        jsonData = JSON.parse(match[1].trim());
      }
    } else if (rawData.startsWith('{') && rawData.endsWith('}')) {
      jsonData = JSON.parse(rawData);
    }
  } catch (e) {
    console.error('Failed to parse JSON data:', e);
  }

  // Create HTML document with styles
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>SEO Audit Report - ${audit.url}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
        h1 { color: #2c3e50; font-size: 24px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
        h2 { color: #3498db; font-size: 20px; margin-top: 20px; margin-bottom: 10px; }
        h3 { color: #2980b9; font-size: 18px; margin-top: 15px; margin-bottom: 10px; }
        p { margin-bottom: 10px; }
        ul, ol { margin-top: 5px; margin-bottom: 15px; padding-left: 20px; }
        li { margin-bottom: 5px; }
        .score { font-size: 18px; font-weight: bold; margin: 10px 0; }
        .score-high { color: #27ae60; }
        .score-medium { color: #f39c12; }
        .score-low { color: #e74c3c; }
        .issue { margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #ddd; }
        .priority-high { border-left-color: #e74c3c; }
        .priority-medium { border-left-color: #f39c12; }
        .priority-low { border-left-color: #3498db; }
        .page-break { page-break-after: always; }
      </style>
    </head>
    <body>
      <h1>Comprehensive SEO Analysis Report</h1>
  `;

  // Add Executive Summary
  html += `
    <h2>Executive Summary</h2>
    <p>${jsonData?.overall?.summary || 'No summary available.'}</p>
    ${jsonData?.overall?.score ? `<p class="score ${getScoreClass(jsonData.overall.score)}">Overall Score: ${jsonData.overall.score}/100</p>` : ''}
  `;

  // Add Key Findings
  if (jsonData?.overall?.keyFindings && jsonData.overall.keyFindings.length > 0) {
    html += `
      <h3>Key Findings</h3>
      <ul>
        ${jsonData.overall.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
      </ul>
    `;
  }

  // Add Quick Wins
  if (jsonData?.overall?.quickWins && jsonData.overall.quickWins.length > 0) {
    html += `
      <h3>Quick Wins</h3>
      <ul>
        ${jsonData.overall.quickWins.map(win => `<li>${win}</li>`).join('')}
      </ul>
    `;
  }

  // Extract issues from overall assessment if specific sections are empty
  const technicalIssues = extractIssuesFromText(jsonData?.overall?.summary || '', ['https', 'http', 'sitemap', 'robots', 'canonical', 'redirect', 'server', 'crawl', 'index']);
  const contentIssues = extractIssuesFromText(jsonData?.overall?.summary || '', ['content', 'keyword', 'word count', 'thin content', 'duplicate', 'readability', 'e-a-t']);
  const onPageIssues = extractIssuesFromText(jsonData?.overall?.summary || '', ['meta', 'title', 'heading', 'h1', 'h2', 'alt text', 'internal link', 'broken link']);
  const performanceIssues = extractIssuesFromText(jsonData?.overall?.summary || '', ['speed', 'load', 'core web vitals', 'mobile', 'responsive', 'image', 'javascript', 'css']);

  // Add Technical SEO Analysis
  html += `
    <div class="page-break"></div>
    <h2>Technical SEO Analysis</h2>
    ${jsonData?.technicalSEO?.summary ? `<p>${jsonData.technicalSEO.summary}</p>` : ''}
    ${jsonData?.technicalSEO?.score ? `<p class="score ${getScoreClass(jsonData.technicalSEO.score)}">Technical Score: ${jsonData.technicalSEO.score}/100</p>` : ''}
    ${formatIssues(jsonData?.technicalSEO?.issues || [])}
    ${jsonData?.technicalSEO?.issues?.length === 0 && technicalIssues.length > 0 ? `
      <div class="issues">
        ${technicalIssues.map(issue => `
          <div class="issue priority-medium">
            <h3>Technical Issue</h3>
            <p>${issue}</p>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  // Add Content Analysis
  html += `
    <div class="page-break"></div>
    <h2>Content Analysis</h2>
    ${jsonData?.contentAnalysis?.summary ? `<p>${jsonData.contentAnalysis.summary}</p>` : ''}
    ${jsonData?.contentAnalysis?.score ? `<p class="score ${getScoreClass(jsonData.contentAnalysis.score)}">Content Score: ${jsonData.contentAnalysis.score}/100</p>` : ''}
    ${formatIssues(jsonData?.contentAnalysis?.issues || [])}
    ${jsonData?.contentAnalysis?.issues?.length === 0 && contentIssues.length > 0 ? `
      <div class="issues">
        ${contentIssues.map(issue => `
          <div class="issue priority-medium">
            <h3>Content Issue</h3>
            <p>${issue}</p>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  // Add On-Page SEO Analysis
  html += `
    <div class="page-break"></div>
    <h2>On-Page SEO Analysis</h2>
    ${jsonData?.onPageSEO?.summary ? `<p>${jsonData.onPageSEO.summary}</p>` : ''}
    ${jsonData?.onPageSEO?.score ? `<p class="score ${getScoreClass(jsonData.onPageSEO.score)}">On-Page Score: ${jsonData.onPageSEO.score}/100</p>` : ''}
    ${formatIssues(jsonData?.onPageSEO?.issues || [])}
    ${jsonData?.onPageSEO?.issues?.length === 0 && onPageIssues.length > 0 ? `
      <div class="issues">
        ${onPageIssues.map(issue => `
          <div class="issue priority-medium">
            <h3>On-Page Issue</h3>
            <p>${issue}</p>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  // Add Performance Analysis
  html += `
    <div class="page-break"></div>
    <h2>Performance Analysis</h2>
    ${jsonData?.performanceAnalysis?.summary ? `<p>${jsonData.performanceAnalysis.summary}</p>` : ''}
    ${jsonData?.performanceAnalysis?.score ? `<p class="score ${getScoreClass(jsonData.performanceAnalysis.score)}">Performance Score: ${jsonData.performanceAnalysis.score}/100</p>` : ''}
    ${formatIssues(jsonData?.performanceAnalysis?.issues || [])}
    ${jsonData?.performanceAnalysis?.issues?.length === 0 && performanceIssues.length > 0 ? `
      <div class="issues">
        ${performanceIssues.map(issue => `
          <div class="issue priority-medium">
            <h3>Performance Issue</h3>
            <p>${issue}</p>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  // Add Page-Specific Analysis
  if (jsonData?.pages && jsonData.pages.length > 0) {
    html += `
      <div class="page-break"></div>
      <h2>Page-Specific Analysis</h2>
      ${formatPageAnalysis(jsonData.pages)}
    `;
  }

  // Add Conclusion
  html += `
    <div class="page-break"></div>
    <h2>Conclusion</h2>
    ${jsonData?.conclusion?.summary ? `<p>${jsonData.conclusion.summary}</p>` : ''}
    ${jsonData?.conclusion?.prioritizedRecommendations && jsonData.conclusion.prioritizedRecommendations.length > 0 ? `
      <h3>Prioritized Recommendations</h3>
      <ol>
        ${jsonData.conclusion.prioritizedRecommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ol>
    ` : ''}
  `;

  // Add Crawl Information
  html += `
    <h2>Crawl Information</h2>
    <p>Pages Crawled: ${audit.report.crawledUrls?.length || 0}</p>
    <p>Crawl Date: ${new Date((report as ExtendedSEOReport).timestamp || '').toLocaleString()}</p>
  `;

  // If no JSON data was found, include the raw content
  if (!jsonData) {
    html += `
      <div class="page-break"></div>
      <h2>Raw Analysis</h2>
      <pre style="white-space: pre-wrap; font-size: 12px; line-height: 1.5; background-color: #f5f5f5; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;">${rawData}</pre>
    `;
  }

  // Close HTML document
  html += `
    </body>
    </html>
  `;

  return html;
}

/**
 * Format issues into HTML
 * @param issues Array of issues
 * @returns Formatted HTML
 */
function formatIssues(issues: any[]): string {
  if (!issues || issues.length === 0) return '';
  
  return `
    <div class="issues">
      ${issues.map(issue => `
        <div class="issue priority-${getIssuePriorityClass(issue.priority || issue.severity)}">
          <h3>${issue.title}</h3>
          <p>${issue.description}</p>
          ${issue.recommendation ? `<p><strong>Recommendation:</strong> ${issue.recommendation}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Format page analysis into HTML
 * @param pages Array of pages
 * @returns Formatted HTML
 */
function formatPageAnalysis(pages: any[]): string {
  if (!pages || pages.length === 0) return '';
  
  return pages.map(page => `
    <div class="page">
      <h3>${page.title || 'Untitled Page'}</h3>
      <p><strong>URL:</strong> <a href="${page.url}">${page.url}</a></p>
      ${page.score ? `<p><strong>Score:</strong> ${page.score}/100</p>` : ''}
      ${page.type ? `<p><strong>Type:</strong> ${page.type}</p>` : ''}
      
      ${page.issues && page.issues.length > 0 ? `
        <h4>Issues</h4>
        ${formatIssues(page.issues)}
      ` : ''}
    </div>
    <hr>
  `).join('');
}

/**
 * Get CSS class based on score
 * @param score Score value
 * @returns CSS class name
 */
function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
}

/**
 * Extract issues from text based on keywords
 * @param text Text to extract issues from
 * @param keywords Keywords to look for
 * @returns Array of extracted issues
 */
function extractIssuesFromText(text: string, keywords: string[]): string[] {
  if (!text) return [];
  
  const issues: string[] = [];
  const sentences = text.split(/[.!?]\s+/);
  
  // Look for sentences containing keywords that indicate issues
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    
    // Check if the sentence contains any of the keywords
    const containsKeyword = keywords.some(keyword => lowerSentence.includes(keyword.toLowerCase()));
    
    // Check if the sentence indicates an issue (contains negative terms)
    const isIssue = containsKeyword && (
      lowerSentence.includes('issue') ||
      lowerSentence.includes('problem') ||
      lowerSentence.includes('improve') ||
      lowerSentence.includes('missing') ||
      lowerSentence.includes('lack') ||
      lowerSentence.includes('broken') ||
      lowerSentence.includes('inconsistent') ||
      lowerSentence.includes('error') ||
      lowerSentence.includes('warning') ||
      lowerSentence.includes('fix') ||
      lowerSentence.includes('hinder') ||
      lowerSentence.includes('poor')
    );
    
    if (isIssue && sentence.trim().length > 20) {
      issues.push(sentence.trim());
    }
  });
  
  return issues;
}

/**
 * Get CSS class based on issue priority
 * @param priority Priority value (can be number or string)
 * @returns CSS class name
 */
function getIssuePriorityClass(priority: any): string {
  if (!priority) return 'medium';
  
  // Handle numeric priorities
  if (typeof priority === 'number') {
    if (priority <= 1) return 'high';
    if (priority <= 2) return 'medium';
    return 'low';
  }
  
  // Handle string priorities
  const priorityStr = String(priority).toLowerCase();
  if (priorityStr.includes('high') || priorityStr.includes('critical')) return 'high';
  if (priorityStr.includes('low') || priorityStr.includes('minor')) return 'low';
  return 'medium';
}
