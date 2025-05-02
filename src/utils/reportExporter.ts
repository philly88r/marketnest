import { SEOAudit, SEOIssue, SEOReport, PageAnalysis } from './seoService';

// Extended interfaces to handle Gemini data
interface ExtendedSEOReport extends SEOReport {
  geminiAudit?: {
    data?: any;
    htmlContent?: string;
    timestamp?: string;
  };
  rawData?: any;
}

interface ExtendedPageAnalysis extends PageAnalysis {
  type?: string;
  breadcrumbPath?: string;
  canonicalUrl?: string;
  examples?: string[];
  estimatedEffort?: string;
  estimatedImpact?: string;
}

/**
 * Convert an SEO audit to a Google Docs compatible format
 * @param audit The SEO audit to convert
 * @returns HTML string that can be opened in Google Docs
 */
export const convertToGoogleDocsFormat = (audit: SEOAudit): string => {
  if (!audit || !audit.report) {
    return '<p>No audit data available</p>';
  }

  const report = audit.report;
  const date = new Date(audit.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Check if we have Gemini data in the report
  const extendedReport = report as ExtendedSEOReport;
  
  // Extract data from geminiAudit
  const geminiData = extendedReport.geminiAudit?.data || extendedReport.rawData || {};
  const htmlContent = extendedReport.geminiAudit?.htmlContent || '';
  
  // Check if we have a timeout situation
  const isTimeout = geminiData.summary?.includes('timeout') || 
                   htmlContent.includes('timeout') || 
                   htmlContent.includes('timed out');

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
          max-width: 8.5in;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
        h1 {
          color: #1a73e8;
          font-size: 24px;
          margin-bottom: 10px;
        }
        h2 {
          color: #1a73e8;
          font-size: 20px;
          margin-top: 30px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 5px;
        }
        h3 {
          color: #1a73e8;
          font-size: 16px;
          margin-top: 20px;
        }
        .score-container {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          flex-wrap: wrap;
        }
        .score-box {
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          padding: 15px;
          text-align: center;
          width: 18%;
          margin-bottom: 10px;
        }
        .score-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .score-value {
          font-size: 24px;
          font-weight: bold;
        }
        .score-high {
          color: #34a853;
        }
        .score-medium {
          color: #fbbc05;
        }
        .score-low {
          color: #ea4335;
        }
        .issue {
          margin-bottom: 20px;
          padding: 15px;
          border-left: 4px solid #e0e0e0;
          background-color: #f8f9fa;
        }
        .issue-high {
          border-left-color: #ea4335;
        }
        .issue-medium {
          border-left-color: #fbbc05;
        }
        .issue-low {
          border-left-color: #34a853;
        }
        .issue-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .issue-severity {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 12px;
          margin-left: 10px;
        }
        .severity-high {
          background-color: #ea4335;
          color: white;
        }
        .severity-medium {
          background-color: #fbbc05;
          color: black;
        }
        .severity-low {
          background-color: #34a853;
          color: white;
        }
        .recommendation {
          margin-top: 10px;
          font-style: italic;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #e0e0e0;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
        }
        .page-list {
          margin-top: 10px;
        }
        .url {
          word-break: break-all;
          color: #1a73e8;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SEO Audit Report</h1>
        <p><strong>Website:</strong> <span class="url">${audit.url}</span></p>
        <p><strong>Date:</strong> ${date}</p>
      </div>

      <h2>Executive Summary</h2>
      <p>${report.overall.summary}</p>

      <div class="score-container">
        <div class="score-box">
          <div class="score-title">Overall</div>
          <div class="score-value ${getScoreClass(report.overall.score)}">${report.overall.score}/100</div>
        </div>
        <div class="score-box">
          <div class="score-title">Technical</div>
          <div class="score-value ${getScoreClass(report.technical?.score || 0)}">${report.technical?.score || 'N/A'}/100</div>
        </div>
        <div class="score-box">
          <div class="score-title">Content</div>
          <div class="score-value ${getScoreClass(report.content?.score || 0)}">${report.content?.score || 'N/A'}/100</div>
        </div>
        <div class="score-box">
          <div class="score-title">On-Page</div>
          <div class="score-value ${getScoreClass(report.onPage?.score || 0)}">${report.onPage?.score || 'N/A'}/100</div>
        </div>
        <div class="score-box">
          <div class="score-title">Performance</div>
          <div class="score-value ${getScoreClass(report.performance?.score || 0)}">${report.performance?.score || 'N/A'}/100</div>
        </div>
      </div>
  `;

  // If we have HTML content from Gemini, extract and use it
  if (htmlContent && htmlContent.trim().length > 0) {
    // Check if the HTML content is actually markdown or JSON
    if (htmlContent.startsWith('```') || htmlContent.startsWith('{')) {
      // This might be raw JSON or markdown that failed to parse
      // Extract any JSON content from markdown code blocks if present
      let processedContent = htmlContent;
      const jsonBlockMatch = htmlContent.match(/```(?:json)?([\s\S]*?)```/m);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        processedContent = jsonBlockMatch[1].trim();
      }
      
      // Try to format it as a readable report
      try {
        // Try to parse it as JSON first
        const jsonData = JSON.parse(processedContent);
        
        // If successful, create a nicely formatted HTML representation
        docContent += `
          <h2>AI-Generated SEO Analysis</h2>
          <div class="ai-analysis">
            <h3>Overall Assessment</h3>
            ${jsonData.overall?.summary ? `<p>${jsonData.overall.summary}</p>` : ''}
            ${jsonData.overall?.score ? `<p><strong>Overall Score:</strong> ${jsonData.overall.score}/100</p>` : ''}
            
            ${jsonData.domainAuthority ? `
              <h3>Domain Overview</h3>
              <p><strong>Domain Authority:</strong> ${jsonData.domainAuthority}</p>
            ` : ''}
            
            ${jsonData.indexationStatus ? `<p><strong>Indexation Status:</strong> ${jsonData.indexationStatus}</p>` : ''}
            ${jsonData.competitiveLandscape ? `<p><strong>Competitive Landscape:</strong> ${jsonData.competitiveLandscape}</p>` : ''}
            
            ${jsonData.keyFindings && jsonData.keyFindings.length > 0 ? `
              <h3>Key Findings</h3>
              <ul>
                ${jsonData.keyFindings.map((finding) => `<li>${finding}</li>`).join('')}
              </ul>
            ` : ''}
            
            ${jsonData.quickWins && jsonData.quickWins.length > 0 ? `
              <h3>Quick Wins</h3>
              <ul>
                ${jsonData.quickWins.map((win) => `<li>${win}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `;
      } catch (e) {
        // If JSON parsing fails, just display the content in a formatted way
        docContent += `
          <h2>AI-Generated SEO Analysis</h2>
          <div class="ai-analysis">
            <pre style="white-space: pre-wrap; font-size: 12px; line-height: 1.5;">${processedContent}</pre>
          </div>
        `;
      }
    } else {
      // This is regular HTML content, add it directly
      docContent += `
        <h2>AI-Generated SEO Analysis</h2>
        <div class="ai-analysis">
          ${htmlContent}
        </div>
      `;
    }
    
    // If this is a timeout case, add some helpful information
    if (isTimeout) {
      docContent += `
        <h2>Recommendations for Improving Analysis</h2>
        <p>The AI analysis timed out, which can happen with complex websites. Here are some suggestions to get better results:</p>
        <ul>
          <li><strong>Analyze fewer pages:</strong> Try limiting the analysis to 5-10 key pages instead of the entire site</li>
          <li><strong>Focus on specific sections:</strong> Run separate analyses for different sections of your website</li>
          <li><strong>Check site performance:</strong> If your website loads slowly, the analysis may time out</li>
          <li><strong>Try during off-peak hours:</strong> Running the analysis when server load is lower may help</li>
        </ul>
      `;
    }
  }
  
  // Add Executive Summary Section with domain info if available
  if (geminiData.domainAuthority || geminiData.indexationStatus || geminiData.competitiveLandscape) {
    docContent += `
      <h2>Domain Overview</h2>
      <table>
        ${geminiData.domainAuthority ? `
          <tr>
            <th>Domain Authority</th>
            <td>${geminiData.domainAuthority}</td>
          </tr>` : ''}
        ${geminiData.indexationStatus ? `
          <tr>
            <th>Indexation Status</th>
            <td>${geminiData.indexationStatus}</td>
          </tr>` : ''}
        ${geminiData.competitiveLandscape ? `
          <tr>
            <th>Competitive Landscape</th>
            <td>${geminiData.competitiveLandscape}</td>
          </tr>` : ''}
      </table>
    `;
  }

  // Add Key Findings Section if available
  if (geminiData.keyFindings && geminiData.keyFindings.length > 0) {
    docContent += `
      <h2>Key Findings</h2>
      <ul>
        ${geminiData.keyFindings.map((finding: string) => `<li>${finding}</li>`).join('')}
      </ul>
    `;
  }

  // Add Quick Wins Section if available
  if (geminiData.quickWins && geminiData.quickWins.length > 0) {
    docContent += `
      <h2>Quick Wins</h2>
      <ul>
        ${geminiData.quickWins.map((win: string) => `<li>${win}</li>`).join('')}
      </ul>
    `;
  }
  
  // Add Critical Issues Section
  const criticalIssues = getCriticalIssues(report);
  docContent += `
    <h2>Critical Issues</h2>
    ${criticalIssues.length > 0 ? 
      criticalIssues.map(issue => renderIssue(issue)).join('') :
      '<p>No critical issues found!</p>'
    }
  `;

  // Add Technical SEO Section
  docContent += `
    <h2>Technical SEO</h2>
    <p>${report.technical?.summary || 'No technical SEO summary available.'}</p>
    ${report.technical?.issues && report.technical.issues.length > 0 ?
      report.technical.issues.map(issue => renderIssue(issue)).join('') :
      '<p>No technical issues found!</p>'
    }
  `;

  // Add Content Analysis Section
  docContent += `
    <h2>Content Analysis</h2>
    <p>${report.content?.summary || 'No content analysis summary available.'}</p>
    ${report.content?.issues && report.content.issues.length > 0 ?
      report.content.issues.map(issue => renderIssue(issue)).join('') :
      '<p>No content issues found!</p>'
    }
  `;

  // Add On-Page SEO Section
  docContent += `
    <h2>On-Page SEO</h2>
    <p>${report.onPage?.summary || 'No on-page SEO summary available.'}</p>
    ${report.onPage?.issues && report.onPage.issues.length > 0 ?
      report.onPage.issues.map(issue => renderIssue(issue)).join('') :
      '<p>No on-page issues found!</p>'
    }
  `;

  // Add Performance Section
  docContent += `
    <h2>Performance</h2>
    <p>${report.performance?.summary || 'No performance summary available.'}</p>
    ${report.performance?.issues && report.performance.issues.length > 0 ?
      report.performance.issues.map(issue => renderIssue(issue)).join('') :
      '<p>No performance issues found!</p>'
    }
  `;

  // Add Crawled Pages Section if available
  if (report.pages && report.pages.length > 0) {
    docContent += `
      <h2>Analyzed Pages</h2>
      <p>Total pages analyzed: ${report.pages.length}</p>
      <table>
        <tr>
          <th>URL</th>
          <th>Title</th>
          <th>Score</th>
          <th>Type</th>
          <th>Issues</th>
        </tr>
        ${report.pages.map(page => `
          <tr>
            <td class="url">${page.url}</td>
            <td>${page.title || 'No title'}</td>
            <td>${page.score || 'N/A'}/100</td>
            <td>${(page as ExtendedPageAnalysis).type || '-'}</td>
            <td>${page.issues?.length || 0}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }
  
  // Add Detailed Page Analysis Section
  if (report.pages && report.pages.length > 0) {
    docContent += `<h2>Detailed Page Analysis</h2>`;
    
    // Loop through each page and show its issues
    report.pages.forEach(page => {
      if (page.issues && page.issues.length > 0) {
        docContent += `
          <h3>${page.title || page.url}</h3>
          <p class="url">${page.url}</p>
          ${(page as ExtendedPageAnalysis).type ? `<p><strong>Page Type:</strong> ${(page as ExtendedPageAnalysis).type}</p>` : ''}
          ${(page as ExtendedPageAnalysis).breadcrumbPath ? `<p><strong>Breadcrumb Path:</strong> ${(page as ExtendedPageAnalysis).breadcrumbPath}</p>` : ''}
          ${(page as ExtendedPageAnalysis).canonicalUrl ? `<p><strong>Canonical URL:</strong> ${(page as ExtendedPageAnalysis).canonicalUrl}</p>` : ''}
          
          <h4>Issues Found (${page.issues.length})</h4>
          ${page.issues.map((issue: any) => renderIssue(issue)).join('')}
        `;
      }
    });
  }

  // Add Recommendations Section
  if (report.recommendations && report.recommendations.length > 0) {
    docContent += `
      <h2>Recommendations</h2>
      ${report.recommendations.map(rec => renderIssue(rec)).join('')}
    `;
  }

  // Add footer
  docContent += `
      <div class="footer">
        <p>Generated by MarketNest SEO Audit Tool</p>
      </div>
    </body>
    </html>
  `;

  return docContent;
};

/**
 * Helper function to render an issue in HTML format
 */
const renderIssue = (issue: any): string => {
  // Handle both standard SEOIssue format and the Gemini format
  const severity = issue.severity || 'medium';
  const title = issue.title || 'Issue';
  const description = issue.description || '';
  const recommendation = issue.recommendation || '';
  const impact = issue.impact || '';
  const priority = issue.priority ? `Priority: ${issue.priority}` : '';
  const effort = issue.estimatedEffort ? `Effort: ${issue.estimatedEffort}` : '';
  const estimatedImpact = issue.estimatedImpact ? `Impact: ${issue.estimatedImpact}` : '';
  
  // Add examples if available
  const examples = issue.examples && issue.examples.length > 0 ? 
    `<div class="examples">
      <strong>Examples:</strong>
      <ul>
        ${issue.examples.map((example: string) => `<li>${example}</li>`).join('')}
      </ul>
    </div>` : '';
  
  return `
    <div class="issue issue-${severity}">
      <div class="issue-title">
        ${title}
        <span class="issue-severity severity-${severity}">
          ${severity.toUpperCase()}
          ${priority ? ` • ${priority}` : ''}
        </span>
      </div>
      <p>${description}</p>
      ${impact ? `<p><strong>Impact:</strong> ${impact}</p>` : ''}
      <div class="recommendation">
        <strong>Recommendation:</strong> ${recommendation}
      </div>
      ${effort || estimatedImpact ? 
        `<div class="metadata">
          ${effort ? `<span>${effort}</span>` : ''}
          ${estimatedImpact ? `<span>${estimatedImpact}</span>` : ''}
        </div>` : ''
      }
      ${examples}
    </div>
  `;
};

/**
 * Helper function to get score class based on value
 */
const getScoreClass = (score: number): string => {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
};

/**
 * Helper function to get critical issues from the report
 */
const getCriticalIssues = (report: SEOReport | null): SEOIssue[] => {
  if (!report) return [];
  
  const issues: SEOIssue[] = [];
  
  // Add technical issues with high severity
  if (report.technical?.issues) {
    issues.push(...report.technical.issues.filter(issue => issue.severity === 'high'));
  }
  
  // Add content issues with high severity
  if (report.content?.issues) {
    issues.push(...report.content.issues.filter(issue => issue.severity === 'high'));
  }
  
  // Add on-page issues with high severity
  if (report.onPage?.issues) {
    issues.push(...report.onPage.issues.filter(issue => issue.severity === 'high'));
  }
  
  // Add performance issues with high severity
  if (report.performance?.issues) {
    issues.push(...report.performance.issues.filter(issue => issue.severity === 'high'));
  }
  
  return issues;
};

/**
 * Generate a Google Docs URL from HTML content
 * @param html HTML content to convert
 * @returns URL that will open the content in Google Docs
 */
export const generateGoogleDocsUrl = (html: string): string => {
  // Encode the HTML content for use in a URL
  const encodedHtml = encodeURIComponent(html);
  
  // Create a Google Docs URL that will import the HTML
  return `https://docs.google.com/document/create?usp=upload_and_import&html=${encodedHtml}`;
};

/**
 * Export SEO audit to Google Docs
 * @param audit SEO audit to export
 */
export const exportToGoogleDocs = (audit: SEOAudit): void => {
  if (!audit || !audit.report) {
    alert('No audit data available to export');
    return;
  }
  
  try {
    // Convert the audit to Google Docs format
    const htmlContent = convertToGoogleDocsFormat(audit);
    
    // Log the first 100 characters for debugging
    console.log(`Generated HTML report (first 100 chars): ${htmlContent.substring(0, 100)}...`);
    console.log(`Report length: ${htmlContent.length} characters`);
    
    // Generate a Google Docs URL
    const googleDocsUrl = generateGoogleDocsUrl(htmlContent);
    
    // Open the URL in a new tab
    window.open(googleDocsUrl, '_blank');
  } catch (error) {
    console.error('Error generating Google Docs report:', error);
    alert(`Error generating report: ${error.message}. Please try again or contact support.`);
  }
};

/**
 * Download SEO audit as HTML file
 * @param audit SEO audit to download
 */
export const downloadAsHtml = (audit: SEOAudit): void => {
  if (!audit || !audit.report) {
    alert('No audit data available to download');
    return;
  }
  
  // Convert the audit to Google Docs format
  const htmlContent = convertToGoogleDocsFormat(audit);
  
  // Create a blob from the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = `seo-audit-${audit.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.html`;
  
  // Append the link to the body
  document.body.appendChild(link);
  
  // Click the link to download the file
  link.click();
  
  // Remove the link from the body
  document.body.removeChild(link);
  
  // Release the URL object
  URL.revokeObjectURL(url);
};
