/**
 * SEO Report Converter
 * Converts SEO audit data to a beautiful HTML report
 * Based on the seo-report-converter.js file
 */

/**
 * Generate HTML report from SEO audit data
 * @param auditResult The SEO audit result object
 * @returns HTML string
 */
export function convertToHtmlReport(auditResult: any): string {
  // Extract the raw Gemini output
  const rawOutput = auditResult.geminiAudit?.rawOutput || '';
  
  // Try to parse the raw output as JSON first
  let jsonData: any = null;
  try {
    // Look for JSON in the raw output (sometimes it's wrapped in markdown code blocks)
    const jsonMatch = rawOutput.match(/```json\s*([\s\S]*?)\s*```/) || 
                      rawOutput.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, rawOutput];
    
    if (jsonMatch && jsonMatch[1]) {
      jsonData = JSON.parse(jsonMatch[1].trim());
    }
  } catch (error) {
    console.warn('Could not parse JSON from raw output:', error);
    // Continue with text-based approach
  }
  
  // If we have valid JSON data, use it to generate the report
  if (jsonData && typeof jsonData === 'object') {
    return generateHtml(jsonData);
  }
  
  // Otherwise, try to extract structured data from the text
  const extractedData = extractDataFromText(rawOutput, auditResult.url);
  return generateHtml(extractedData);
}

/**
 * Extract structured data from raw text output
 * @param text Raw text output
 * @param url Website URL
 * @returns Structured data object
 */
function extractDataFromText(text: string, url: string): any {
  // Initialize data structure
  const data: any = {
    overall: {
      summary: '',
      score: 0,
      keyFindings: [],
      quickWins: []
    },
    pages: []
  };
  
  // Split text into sections
  const lines = text.split('\n');
  let currentSection = '';
  
  // Extract domain from URL
  const domain = url ? new URL(url).hostname : '';
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Extract overall summary
    if (line.includes('SEO Analysis for') || line.includes('Overall Assessment')) {
      currentSection = 'summary';
      // Get the next non-empty line as summary
      let summaryText = '';
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.startsWith('Score:')) {
          summaryText += nextLine + ' ';
        }
        if (nextLine.startsWith('Score:') || nextLine.startsWith('#') || 
            nextLine.startsWith('Technical SEO') || nextLine.startsWith('Content Analysis') ||
            nextLine.startsWith('On-Page SEO') || nextLine.startsWith('Performance')) {
          break;
        }
      }
      data.overall.summary = summaryText.trim();
    }
    
    // Extract score
    if (line.startsWith('Score:')) {
      const scoreMatch = line.match(/Score:\s*(\d+)\/100/);
      if (scoreMatch && scoreMatch[1]) {
        data.overall.score = parseInt(scoreMatch[1]);
      }
    }
    
    // Extract key findings
    if (line.includes('Critical Issues') || line.includes('Key Findings')) {
      currentSection = 'keyFindings';
      continue;
    }
    
    // Extract technical issues
    if (line.includes('Technical SEO')) {
      currentSection = 'technical';
      continue;
    }
    
    // Extract content issues
    if (line.includes('Content Analysis')) {
      currentSection = 'content';
      continue;
    }
    
    // Extract on-page issues
    if (line.includes('On-Page SEO')) {
      currentSection = 'onPage';
      continue;
    }
    
    // Extract performance issues
    if (line.includes('Performance')) {
      currentSection = 'performance';
      continue;
    }
    
    // Process list items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const item = line.substring(2).trim();
      
      if (currentSection === 'keyFindings') {
        data.overall.keyFindings.push(item);
      } else if (currentSection === 'technical' || currentSection === 'content' || 
                 currentSection === 'onPage' || currentSection === 'performance') {
        // Add as a quick win if it sounds like an actionable item
        if (item.toLowerCase().includes('improve') || 
            item.toLowerCase().includes('fix') || 
            item.toLowerCase().includes('optimize') ||
            item.toLowerCase().includes('add') ||
            item.toLowerCase().includes('remove') ||
            item.toLowerCase().includes('update')) {
          data.overall.quickWins.push(item);
        }
        
        // Add as a page issue
        if (!data.pages[0]) {
          data.pages[0] = {
            title: domain,
            url: url,
            score: data.overall.score,
            issues: []
          };
        }
        
        data.pages[0].issues.push({
          title: `${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Issue`,
          severity: getSeverityFromText(item),
          description: item,
          impact: 'May affect search rankings and user experience',
          recommendation: getRecommendationFromIssue(item)
        });
      }
    }
  }
  
  return data;
}

/**
 * Generate HTML from structured data
 * @param data Structured data object
 * @returns HTML string
 */
function generateHtml(data: any): string {
  // Extract overall data
  const overall = data.overall;
  
  // Begin HTML document
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.overall ? 'SEO Audit: ' + getDomainFromSummary(data.overall.summary) : 'SEO Audit Report'}</title>
    <style>
        :root {
            --primary: #8B4513;
            --secondary: #D2B48C;
            --light: #F5F5DC;
            --dark: #3E2723;
            --accent: #FF6F00;
            --white: #FFFFFF;
            --gray: #E0E0E0;
            --gray-dark: #707070;
            --success: #4CAF50;
            --warning: #FF9800;
            --danger: #F44336;
            --info: #2196F3;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: var(--light);
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: var(--white);
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        header {
            background-color: var(--primary);
            color: var(--white);
            padding: 30px;
            text-align: center;
        }
        
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .date {
            background-color: var(--secondary);
            color: var(--dark);
            text-align: right;
            padding: 10px 30px;
            font-weight: 500;
        }
        
        .section {
            padding: 30px;
            border-bottom: 1px solid var(--gray);
        }
        
        .section h2 {
            color: var(--primary);
            margin-bottom: 20px;
            border-bottom: 2px solid var(--secondary);
            padding-bottom: 10px;
        }
        
        .score-container {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .score-box {
            background-color: var(--light);
            border-radius: 8px;
            padding: 20px;
            flex: 1;
            min-width: 300px;
            display: flex;
            align-items: center;
        }
        
        .score {
            font-size: 3.5rem;
            font-weight: bold;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .score-high {
            background-color: #E8F5E9;
            color: #2E7D32;
        }
        
        .score-medium {
            background-color: #FFF8E1;
            color: #FF8F00;
        }
        
        .score-low {
            background-color: #FFEBEE;
            color: #C62828;
        }
        
        .score-details {
            flex: 1;
        }
        
        .score-details h3 {
            color: var(--dark);
            margin-bottom: 10px;
        }
        
        .summary {
            background-color: var(--white);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        
        .meta-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .meta-box {
            background-color: var(--light);
            padding: 15px;
            border-radius: 8px;
        }
        
        .meta-box h4 {
            color: var(--primary);
            margin-bottom: 10px;
            border-bottom: 1px solid var(--secondary);
            padding-bottom: 5px;
        }
        
        .findings-section h3 {
            color: var(--primary);
            margin: 20px 0 15px;
        }
        
        .findings-list {
            list-style-type: none;
        }
        
        .findings-list li {
            background-color: var(--light);
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 5px;
            border-left: 5px solid var(--secondary);
        }
        
        .quick-wins-list {
            list-style-type: none;
        }
        
        .quick-wins-list li {
            background-color: #E8F5E9;
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 5px;
            border-left: 5px solid #81C784;
        }
        
        .page-card {
            background-color: var(--white);
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .page-header {
            background-color: var(--secondary);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .page-title {
            flex: 1;
        }
        
        .page-title h3 {
            color: var(--dark);
            margin-bottom: 5px;
        }
        
        .page-title p {
            color: var(--dark);
            opacity: 0.8;
            font-size: 0.9rem;
        }
        
        .page-score {
            font-size: 1.8rem;
            font-weight: bold;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .page-body {
            padding: 20px;
        }
        
        .page-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .page-meta-item {
            background-color: var(--light);
            padding: 10px;
            border-radius: 5px;
        }
        
        .page-meta-item h4 {
            font-size: 0.9rem;
            color: var(--dark);
            margin-bottom: 5px;
        }
        
        .issues-container {
            margin-top: 20px;
        }
        
        .issue-card {
            background-color: var(--light);
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .issue-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .issue-title {
            font-weight: bold;
            color: var(--dark);
        }
        
        .issue-severity {
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .severity-high {
            background-color: #FFEBEE;
            color: #C62828;
        }
        
        .severity-medium {
            background-color: #FFF8E1;
            color: #FF8F00;
        }
        
        .severity-low {
            background-color: #E8F5E9;
            color: #2E7D32;
        }
        
        .issue-description {
            margin-bottom: 10px;
        }
        
        .issue-impact {
            margin-bottom: 10px;
            font-style: italic;
        }
        
        .issue-recommendation {
            background-color: #E3F2FD;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #2196F3;
        }
        
        .toggle-btn {
            background-color: var(--secondary);
            border: none;
            color: var(--dark);
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .toggle-content {
            display: none;
        }
        
        .show {
            display: block;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background-color: var(--secondary);
            color: var(--dark);
        }
        
        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
            }
            
            .page-score {
                margin-top: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>SEO Audit Report</h1>
            <p>${data.overall ? getDomainFromSummary(data.overall.summary) : 'Website Analysis'}</p>
        </header>
        
        <div class="date">
            <p>Generated: ${data.overall && data.overall.timestamp ? formatDate(data.overall.timestamp) : new Date().toLocaleDateString()}</p>
        </div>`;

  // Overall section
  if (overall) {
    html += `
        <div class="section">
            <h2>Overview</h2>
            <div class="score-container">
                <div class="score-box">
                    <div class="score ${getScoreClass(overall.score)}">${overall.score}</div>
                    <div class="score-details">
                        <h3>Overall Score</h3>
                        <p>Based on technical SEO, content, and user experience factors</p>
                    </div>
                </div>
            </div>
            
            <div class="summary">
                <h3>Executive Summary</h3>
                <p>${overall.summary}</p>
            </div>
            
            <div class="meta-info">
                <div class="meta-box">
                    <h4>Domain Authority</h4>
                    <p>${overall.domainAuthority || 'Not specified'}</p>
                </div>
                <div class="meta-box">
                    <h4>Indexation Status</h4>
                    <p>${overall.indexationStatus || 'Not specified'}</p>
                </div>
                <div class="meta-box">
                    <h4>Competitive Landscape</h4>
                    <p>${overall.competitiveLandscape || 'Not specified'}</p>
                </div>
            </div>
            
            <div class="findings-section">
                <h3>Key Findings</h3>
                <ul class="findings-list">
                    ${overall.keyFindings && overall.keyFindings.length > 0 ? 
                      overall.keyFindings.map((finding: string) => `<li>${finding}</li>`).join('') : 
                      '<li>No key findings provided</li>'}
                </ul>
            </div>
            
            <div class="findings-section">
                <h3>Quick Wins</h3>
                <ul class="quick-wins-list">
                    ${overall.quickWins && overall.quickWins.length > 0 ? 
                      overall.quickWins.map((win: string) => `<li>${win}</li>`).join('') : 
                      '<li>No quick wins provided</li>'}
                </ul>
            </div>
        </div>`;
  }

  // Pages section
  if (data.pages && data.pages.length > 0) {
    html += `
        <div class="section">
            <h2>Page Analysis</h2>`;

    // Add each page
    data.pages.forEach((page: any) => {
      html += `
            <div class="page-card">
                <div class="page-header">
                    <div class="page-title">
                        <h3>${page.title || 'Page'}</h3>
                        <p>${page.url || 'URL not specified'}</p>
                    </div>
                    <div class="page-score ${getScoreClass(page.score)}">${page.score || '?'}</div>
                </div>
                
                <div class="page-body">
                    <div class="page-meta">
                        <div class="page-meta-item">
                            <h4>Page Type</h4>
                            <p>${page.type || 'Not specified'}</p>
                        </div>
                        <div class="page-meta-item">
                            <h4>Breadcrumb Path</h4>
                            <p>${page.breadcrumbPath || 'Not specified'}</p>
                        </div>
                        <div class="page-meta-item">
                            <h4>Indexability</h4>
                            <p>${page.indexability ? page.indexability.status : 'Not specified'}</p>
                        </div>
                    </div>
                    
                    <div class="issues-container">
                        <h3>Issues Identified</h3>`;

      // Add issues if they exist
      if (page.issues && page.issues.length > 0) {
        page.issues.forEach((issue: any) => {
          html += `
                        <div class="issue-card">
                            <div class="issue-header">
                                <div class="issue-title">${issue.title || 'Issue'}</div>
                                <div class="issue-severity severity-${issue.severity || 'medium'}">${capitalizeFirstLetter(issue.severity || 'medium')}</div>
                            </div>
                            <div class="issue-description">${issue.description || 'No description provided'}</div>
                            <div class="issue-impact"><strong>Impact:</strong> ${issue.impact || 'Impact not specified'}</div>
                            <div class="issue-recommendation"><strong>Recommendation:</strong> ${issue.recommendation || 'No recommendation provided'}</div>
                        </div>`;
        });
      } else {
        html += `<p>No issues identified for this page.</p>`;
      }

      html += `
                    </div>
                </div>
            </div>`;
    });

    html += `
        </div>`;
  }

  // Footer
  html += `
        <div class="footer">
            <p>Generated by MarketNest SEO Audit Tool</p>
        </div>
    </div>
    
    <script>
        function toggleContent(button) {
            const content = button.nextElementSibling;
            content.classList.toggle('show');
            button.textContent = content.classList.contains('show') ? 'Hide Technical Details' : 'View Technical Details';
        }
    </script>
</body>
</html>`;

  return html;
}

// Helper Functions
function getDomainFromSummary(summary: string): string {
  if (!summary) return 'Website';
  
  // Try to extract domain name from the summary
  const match = summary.match(/([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/);
  return match ? match[1] : 'Website';
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return new Date().toLocaleDateString();
  }
}

function getScoreClass(score: number): string {
  if (!score) return 'score-medium';
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
}

function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getSeverityFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check for critical/high severity indicators
  if (lowerText.includes('critical') || 
      lowerText.includes('severe') || 
      lowerText.includes('broken') ||
      lowerText.includes('missing') ||
      lowerText.includes('urgent') ||
      lowerText.includes('error')) {
    return 'high';
  }
  
  // Check for low severity indicators
  if (lowerText.includes('minor') || 
      lowerText.includes('consider') || 
      lowerText.includes('could') ||
      lowerText.includes('might') ||
      lowerText.includes('suggestion')) {
    return 'low';
  }
  
  // Default to medium
  return 'medium';
}

function getRecommendationFromIssue(issue: string): string {
  // If the issue already contains a recommendation, extract it
  if (issue.includes('Recommendation:')) {
    const parts = issue.split('Recommendation:');
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }
  
  // Generate a recommendation based on the issue text
  const lowerIssue = issue.toLowerCase();
  
  if (lowerIssue.includes('broken')) {
    return 'Fix broken links or resources to ensure proper user experience and crawlability.';
  }
  
  if (lowerIssue.includes('missing')) {
    return 'Add the missing elements to improve SEO and user experience.';
  }
  
  if (lowerIssue.includes('slow') || lowerIssue.includes('speed') || lowerIssue.includes('performance')) {
    return 'Optimize page loading speed by compressing images, minifying code, and leveraging browser caching.';
  }
  
  if (lowerIssue.includes('meta') || lowerIssue.includes('title') || lowerIssue.includes('description')) {
    return 'Optimize meta tags with relevant keywords and compelling descriptions to improve click-through rates.';
  }
  
  if (lowerIssue.includes('mobile') || lowerIssue.includes('responsive')) {
    return 'Ensure the website is fully responsive and provides a good experience on all device types.';
  }
  
  if (lowerIssue.includes('content') || lowerIssue.includes('thin')) {
    return 'Enhance content quality and depth to provide more value to users and improve search rankings.';
  }
  
  if (lowerIssue.includes('heading') || lowerIssue.includes('h1') || lowerIssue.includes('h2')) {
    return 'Implement a proper heading structure with relevant keywords to improve content hierarchy and SEO.';
  }
  
  // Default recommendation
  return 'Address this issue to improve overall SEO performance and user experience.';
}
