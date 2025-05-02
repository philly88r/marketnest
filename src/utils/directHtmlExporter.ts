/**
 * Direct HTML Exporter
 * 
 * This utility bypasses JSON parsing entirely and directly extracts useful information
 * from the Gemini API response, even when the response contains malformed JSON.
 * It uses regex pattern matching to identify and extract key sections of the SEO analysis.
 */

import { SEOAudit, SEOReport } from './seoService';
import { safeParseJson } from './jsonRepair';

// Extend the SEOReport type to include Gemini-specific properties
interface ExtendedSEOReport extends SEOReport {
  geminiAudit?: {
    data?: any;
    htmlContent?: string;
    rawResponse?: string;
    timestamp?: string;
    parseError?: string;
  };
  timestamp?: string;
}

interface ExtractedSection {
  title: string;
  content: string;
}

/**
 * Directly export an SEO audit to Google Docs without relying on JSON parsing
 * @param audit The SEO audit to export
 * @returns A URL that will open in Google Docs with the formatted report
 */
export const directExportToGoogleDocs = (audit: SEOAudit): string => {
  if (!audit || !audit.report) {
    throw new Error('No audit data available to export');
  }

  // Get the raw HTML content from the Gemini audit
  const extendedReport = audit.report as ExtendedSEOReport;
  const rawContent = extendedReport.geminiAudit?.rawResponse || 
                    extendedReport.geminiAudit?.htmlContent || 
                    '';
  
  // Generate HTML content for Google Docs
  const htmlContent = generateGoogleDocsHtml(audit, rawContent);
  
  // Create a Google Docs URL
  return generateGoogleDocsUrl(htmlContent);
};

/**
 * Generate Google Docs compatible HTML from the SEO audit
 * @param audit The SEO audit
 * @param rawContent The raw content from Gemini
 * @returns HTML formatted for Google Docs
 */
const generateGoogleDocsHtml = (audit: SEOAudit, rawContent: string): string => {
  // Extract key sections from the raw content
  const sections = extractSections(rawContent);
  
  // Create a Google Docs compatible HTML document
  let docContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>SEO Audit Report - ${audit.url}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #2c3e50;
          font-size: 24px;
          margin-top: 20px;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        h2 {
          color: #3498db;
          font-size: 20px;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        h3 {
          color: #2980b9;
          font-size: 18px;
          margin-top: 15px;
          margin-bottom: 10px;
        }
        p {
          margin-bottom: 10px;
        }
        ul, ol {
          margin-top: 5px;
          margin-bottom: 15px;
          padding-left: 20px;
        }
        li {
          margin-bottom: 5px;
        }
        .score {
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
        }
        .score-high {
          color: #27ae60;
        }
        .score-medium {
          color: #f39c12;
        }
        .score-low {
          color: #e74c3c;
        }
        .issue {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f9f9f9;
          border-left: 4px solid #ddd;
        }
        .issue-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .issue-description {
          margin-bottom: 5px;
        }
        .issue-recommendation {
          font-style: italic;
          color: #555;
        }
        .priority-high {
          border-left-color: #e74c3c;
        }
        .priority-medium {
          border-left-color: #f39c12;
        }
        .priority-low {
          border-left-color: #3498db;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .timestamp {
          color: #7f8c8d;
          font-size: 14px;
          margin-top: 5px;
        }
        .section {
          margin-bottom: 25px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SEO Audit Report</h1>
        <p>Website: ${audit.url}</p>
        <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
      </div>
  `;

  // Add the executive summary section
  docContent += `
    <div class="section">
      <h1>Comprehensive SEO Analysis Report</h1>
      <h2>Executive Summary</h2>
      ${sections.summary ? `<p>${sections.summary}</p>` : '<p>No summary available.</p>'}
      ${sections.score ? `
        <p class="score ${getScoreClass(sections.score)}">
          Overall Score: ${sections.score}/100
        </p>
      ` : ''}
    </div>
  `;

  // Add key findings section
  if (sections.keyFindings) {
    docContent += `
      <div class="section">
        <h2>Key Findings</h2>
        <ul>
          ${formatBulletPoints(sections.keyFindings)}
        </ul>
      </div>
    `;
  }

  // Add quick wins section
  if (sections.quickWins) {
    docContent += `
      <div class="section">
        <h2>Quick Wins</h2>
        <ul>
          ${formatBulletPoints(sections.quickWins)}
        </ul>
      </div>
    `;
  }

  // Add technical SEO analysis section
  docContent += `
    <div class="section page-break">
      <h2>Technical SEO Analysis</h2>
      ${sections.technicalSummary ? `<p>${sections.technicalSummary}</p>` : ''}
      ${sections.technicalScore ? `
        <p class="score ${getScoreClass(sections.technicalScore)}">
          Technical SEO Score: ${sections.technicalScore}/100
        </p>
      ` : ''}
      ${sections.technicalIssues ? formatIssues(sections.technicalIssues) : ''}
    </div>
  `;

  // Add content analysis section
  docContent += `
    <div class="section page-break">
      <h2>Content Analysis</h2>
      ${sections.contentSummary ? `<p>${sections.contentSummary}</p>` : ''}
      ${sections.contentScore ? `
        <p class="score ${getScoreClass(sections.contentScore)}">
          Content Score: ${sections.contentScore}/100
        </p>
      ` : ''}
      ${sections.contentIssues ? formatIssues(sections.contentIssues) : ''}
    </div>
  `;

  // Add on-page SEO analysis section
  docContent += `
    <div class="section page-break">
      <h2>On-Page SEO Analysis</h2>
      ${sections.onPageSummary ? `<p>${sections.onPageSummary}</p>` : ''}
      ${sections.onPageScore ? `
        <p class="score ${getScoreClass(sections.onPageScore)}">
          On-Page SEO Score: ${sections.onPageScore}/100
        </p>
      ` : ''}
      ${sections.onPageIssues ? formatIssues(sections.onPageIssues) : ''}
    </div>
  `;

  // Add page-specific analysis if available
  if (sections.pageAnalysis) {
    docContent += `
      <div class="section page-break">
        <h2>Page-Specific Analysis</h2>
        ${sections.pageAnalysis}
      </div>
    `;
  }

  // Add performance analysis section
  docContent += `
    <div class="section page-break">
      <h2>Performance Analysis</h2>
      ${sections.performanceSummary ? `<p>${sections.performanceSummary}</p>` : ''}
      ${sections.performanceScore ? `
        <p class="score ${getScoreClass(sections.performanceScore)}">
          Performance Score: ${sections.performanceScore}/100
        </p>
      ` : ''}
      ${sections.performanceIssues ? formatIssues(sections.performanceIssues) : ''}
    </div>
  `;
  
  // Add conclusion section
  docContent += `
    <div class="section page-break">
      <h2>Conclusion</h2>
      ${sections.conclusion ? `<p>${sections.conclusion}</p>` : ''}
      ${sections.recommendations ? `
        <h3>Prioritized Recommendations</h3>
        <ol>
          ${formatBulletPoints(sections.recommendations)}
        </ol>
      ` : ''}
    </div>
  `;
  
  // Add crawl information
  docContent += `
    <div class="section">
      <h2>Crawl Information</h2>
      <table>
        <tr>
          <th>Pages Crawled</th>
          <td>${audit.report.crawledUrls?.length || 0}</td>
        </tr>
        <tr>
          <th>Crawl Date</th>
          <td>${new Date((audit.report as ExtendedSEOReport).timestamp || '').toLocaleString()}</td>
        </tr>
      </table>
    </div>
  `;

  // If no sections were found, add the raw content as a fallback
  if (Object.values(sections).every(section => !section)) {
    docContent += `
      <div class="section">
        <h2>Raw Analysis</h2>
        <p>The AI has analyzed your website and provided the following insights:</p>
        <pre style="white-space: pre-wrap; font-size: 12px; line-height: 1.5; background-color: #f5f5f5; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;">${rawContent}</pre>
      </div>
    `;
  }

  // Close the HTML document
  docContent += `
    </body>
    </html>
  `;

  return docContent;
};

/**
 * Extract key sections from the raw Gemini response using regex patterns
 * @param content The raw content from Gemini
 * @returns An object containing extracted sections
 */
const extractSections = (content: string): Record<string, string> => {
  const sections: Record<string, string> = {
    summary: '',
    score: '',
    keyFindings: '',
    quickWins: '',
    technicalSummary: '',
    technicalScore: '',
    technicalIssues: '',
    contentSummary: '',
    contentScore: '',
    contentIssues: '',
    onPageSummary: '',
    onPageScore: '',
    onPageIssues: '',
    performanceSummary: '',
    performanceScore: '',
    performanceIssues: '',
    conclusion: '',
    recommendations: '',
    pageAnalysis: ''
  };

  // Check if content is a markdown code block with JSON
  if (content.trim().startsWith('```json') && content.includes('}')) {
    try {
      // Extract JSON from markdown code block
      const jsonMatch = content.match(/```json\s*([\s\S]+?)```/);
      if (jsonMatch && jsonMatch[1]) {
        const jsonString = jsonMatch[1].trim();
        const jsonData = safeParseJson(jsonString);

        // If we successfully parsed the JSON, extract sections from it
        if (typeof jsonData === 'object') {
          // Extract summary
          if (jsonData.overall?.summary) {
            sections.summary = jsonData.overall.summary;
          }

          // Extract score
          if (jsonData.overall?.score) {
            sections.score = jsonData.overall.score.toString();
          }

          // Extract key findings
          if (jsonData.overall?.keyFindings && Array.isArray(jsonData.overall.keyFindings)) {
            sections.keyFindings = jsonData.overall.keyFindings.map(finding => `<li>${finding}</li>`).join('');
          } else if (jsonData.keyFindings && Array.isArray(jsonData.keyFindings)) {
            sections.keyFindings = jsonData.keyFindings.map(finding => `<li>${finding}</li>`).join('');
          }

          // Extract quick wins
          if (jsonData.overall?.quickWins && Array.isArray(jsonData.overall.quickWins)) {
            sections.quickWins = jsonData.overall.quickWins.map(win => `<li>${win}</li>`).join('');
          } else if (jsonData.quickWins && Array.isArray(jsonData.quickWins)) {
            sections.quickWins = jsonData.quickWins.map(win => `<li>${win}</li>`).join('');
          }

          // Extract page-specific issues
          if (jsonData.pages && Array.isArray(jsonData.pages)) {
            let pageAnalysis = '';

            jsonData.pages.forEach((page, index) => {
              if (page.url && page.title) {
                pageAnalysis += `
                  <div class="page-analysis">
                    <h3>${page.title}</h3>
                    <p><strong>URL:</strong> <a href="${page.url}">${page.url}</a></p>
                    ${page.score ? `<p><strong>Score:</strong> ${page.score}/100</p>` : ''}
                    ${page.type ? `<p><strong>Page Type:</strong> ${page.type}</p>` : ''}

                    ${page.issues && Array.isArray(page.issues) && page.issues.length > 0 ? `
                      <h4>Issues</h4>
                      <div class="page-issues">
                        ${page.issues.map(issue => `
                          <div class="issue priority-${getPriorityClass(issue.priority)}">
                            <div class="issue-title">${issue.title}</div>
                            <div class="issue-description">${issue.description}</div>
                            ${issue.recommendation ? `<div class="issue-recommendation">Recommendation: ${issue.recommendation}</div>` : ''}
                            ${issue.severity ? `<div class="issue-severity">Severity: ${issue.severity}</div>` : ''}
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                  ${index < jsonData.pages.length - 1 ? '<hr>' : ''}
                `;
              }
            });

            sections.pageAnalysis = pageAnalysis;
          }

          // Return early since we've successfully extracted data from JSON
          return sections;
        }
      }
    } catch (e) {
      console.error('Error parsing JSON from markdown code block:', e);
      // Continue with regular extraction if JSON parsing fails
    }
  }

  // Note: This section has been replaced by the enhancedReportExporter.ts
  // which provides a more streamlined approach to handling the comprehensive report structure
  
  // If we don't have valid JSON or couldn't extract from it, try regex patterns
  
  // Extract overall summary
  const summaryMatch = content.match(/"summary"\s*:\s*"([^"]+)"/);
  if (summaryMatch && summaryMatch[1]) {
    sections.summary = summaryMatch[1];
  } else {
    // Try alternative pattern
    const altSummaryMatch = content.match(/Overall Assessment[^:]*:[^A-Za-z]*([\s\S]*?)(?=\n\n|\n#|\n<h|$)/i);
    if (altSummaryMatch && altSummaryMatch[1]) {
      sections.summary = altSummaryMatch[1].trim();
    }
  }

  // Extract overall score
  const scoreMatch = content.match(/"score"\s*:\s*(\d+)/);
  if (scoreMatch && scoreMatch[1]) {
    sections.score = scoreMatch[1];
  } else {
    // Try alternative pattern
    const altScoreMatch = content.match(/Overall Score[^:]*:[^A-Za-z]*(\d+)/i);
    if (altScoreMatch && altScoreMatch[1]) {
      sections.score = altScoreMatch[1];
    }
  }

  // Extract key findings
  const keyFindingsMatch = content.match(/Key Findings[^:]*:([^#]+)(?=\n#|\n<h|$)/i);
  if (keyFindingsMatch && keyFindingsMatch[1]) {
    sections.keyFindings = keyFindingsMatch[1].trim();
  }

  // Extract quick wins
  const quickWinsMatch = content.match(/Quick Wins[^:]*:([^#]+)(?=\n#|\n<h|$)/i);
  if (quickWinsMatch && quickWinsMatch[1]) {
    sections.quickWins = quickWinsMatch[1].trim();
  }

  // Extract technical issues
  const technicalIssuesMatch = content.match(/Technical (SEO )?Issues[^:]*:([^#]+)(?=\n#|\n<h|$)/i);
  if (technicalIssuesMatch && technicalIssuesMatch[2]) {
    sections.technicalIssues = technicalIssuesMatch[2].trim();
  }

  // Extract content issues
  const contentIssuesMatch = content.match(/Content Issues[^:]*:([^#]+)(?=\n#|\n<h|$)/i);
  if (contentIssuesMatch && contentIssuesMatch[1]) {
    sections.contentIssues = contentIssuesMatch[1].trim();
  }

  // Extract on-page issues
  const onPageIssuesMatch = content.match(/On-Page (SEO )?Issues[^:]*:([^#]+)(?=\n#|\n<h|$)/i);
  if (onPageIssuesMatch && onPageIssuesMatch[2]) {
    sections.onPageIssues = onPageIssuesMatch[2].trim();
  }

  // Extract page-specific analysis
  const pageAnalysisMatch = content.match(/Page-Specific Analysis[^:]*:([^#]+)(?=\n#|\n<h|$)/i);
  if (pageAnalysisMatch && pageAnalysisMatch[1]) {
    sections.pageAnalysis = pageAnalysisMatch[1].trim();
  }

  return sections;
};

/**
 * Format bullet points from a string containing bullet points or a list
 * @param content The content string with bullet points
 * @returns HTML formatted bullet points
 */
const formatBulletPoints = (content: string): string => {
  if (!content) return '';

  // Split by common bullet point patterns
  const lines = content.split(/\n+/).map(line => line.trim());
  
  return lines
    .filter(line => line && !line.match(/^(key findings|quick wins):/i))
    .map(line => {
      // Remove bullet point markers
      return `<li>${line.replace(/^[-*•]|\d+\.\s+/, '')}</li>`;
    })
    .join('');
};

/**
 * Get priority class based on priority value
 * @param priority The priority value (can be number or string)
 * @returns CSS class for styling
 */
const getPriorityClass = (priority: any): string => {
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
};

/**
 * Format issues from a string containing issue descriptions
 * @param content The content string with issues
 * @returns HTML formatted issues
 */
const formatIssues = (content: string): string => {
  if (!content) return '';

  // Split by common issue patterns
  const issueBlocks = content.split(/\n\s*\n/).filter(block => block.trim());
  
  return issueBlocks
    .map(block => {
      // Try to extract title, description and recommendation
      const titleMatch = block.match(/^([^:]+):/);
      const title = titleMatch ? titleMatch[1].trim() : 'Issue';
      
      // Determine priority based on keywords
      let priority = 'medium';
      if (block.toLowerCase().includes('critical') || block.toLowerCase().includes('high priority')) {
        priority = 'high';
      } else if (block.toLowerCase().includes('low priority') || block.toLowerCase().includes('minor')) {
        priority = 'low';
      }
      
      // Extract recommendation if present
      const recommendationMatch = block.match(/recommendation:([^.]+)/i);
      const recommendation = recommendationMatch ? recommendationMatch[1].trim() : '';
      
      // Remove title and recommendation from description
      let description = block;
      if (titleMatch) {
        description = description.replace(titleMatch[0], '');
      }
      if (recommendationMatch) {
        description = description.replace(recommendationMatch[0], '');
      }
      description = description.trim();
      
      return `
        <div class="issue priority-${priority}">
          <div class="issue-title">${title}</div>
          <div class="issue-description">${description}</div>
          ${recommendation ? `<div class="issue-recommendation">Recommendation: ${recommendation}</div>` : ''}
        </div>
      `;
    })
    .join('');
};

/**
 * Get CSS class based on score value
 * @param score The score value
 * @returns CSS class for styling
 */
const getScoreClass = (score: string): string => {
  const numScore = parseInt(score, 10);
  if (numScore >= 80) return 'score-high';
  if (numScore >= 60) return 'score-medium';
  return 'score-low';
};

/**
 * Generate a Google Docs URL from HTML content
 * @param html The HTML content to convert to Google Docs
 * @returns A URL that will open in Google Docs
 */
const generateGoogleDocsUrl = (html: string): string => {
  // Encode the HTML content for the URL
  const encodedHtml = encodeURIComponent(html);
  
  // Create a Google Docs URL
  return `https://docs.google.com/document/create?usp=openurl&html=${encodedHtml}`;
};
