// SEO Report JSON to HTML Converter
// This script converts an SEO audit JSON into a beautiful HTML report

document.addEventListener('DOMContentLoaded', function() {
  // Attach event listener to the convert button
  document.getElementById('convertBtn').addEventListener('click', convertJsonToHtml);
});

function convertJsonToHtml() {
  // Get the JSON input
  const jsonInput = document.getElementById('jsonInput').value;
  
  try {
    // Parse the JSON
    const data = JSON.parse(jsonInput);
    
    // Generate HTML
    const html = generateHtml(data);
    
    // Display the result
    document.getElementById('htmlOutput').value = html;
    
    // Show the preview
    document.getElementById('preview').innerHTML = html;
    document.getElementById('previewSection').style.display = 'block';
    
  } catch (error) {
    alert('Error parsing JSON: ' + error.message);
  }
}

function generateHtml(data) {
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
                    ${overall.keyFindings ? overall.keyFindings.map(finding => `<li>${finding}</li>`).join('') : '<li>No key findings provided</li>'}
                </ul>
            </div>
            
            <div class="findings-section">
                <h3>Quick Wins</h3>
                <ul class="quick-wins-list">
                    ${overall.quickWins ? overall.quickWins.map(win => `<li>${win}</li>`).join('') : '<li>No quick wins provided</li>'}
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
    data.pages.forEach(page => {
      html += `
            <div class="page-card">
                <div class="page-header">
                    <div class="page-title">
                        <h3>${page.title}</h3>
                        <p>${page.url}</p>
                    </div>
                    <div class="page-score ${getScoreClass(page.score)}">${page.score}</div>
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
                    
                    <button class="toggle-btn" onclick="toggleContent(this)">View Technical Details</button>
                    <div class="toggle-content">
                        <div class="page-meta">
                            <div class="page-meta-item">
                                <h4>Last Modified</h4>
                                <p>${page.lastModified || 'Not specified'}</p>
                            </div>
                            <div class="page-meta-item">
                                <h4>Canonical URL</h4>
                                <p>${page.canonicalUrl || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="issues-container">
                        <h3>Issues Identified</h3>`;

      // Add issues if they exist
      if (page.issues && page.issues.length > 0) {
        page.issues.forEach(issue => {
          html += `
                        <div class="issue-card">
                            <div class="issue-header">
                                <div class="issue-title">${issue.title}</div>
                                <div class="issue-severity severity-${issue.severity}">${capitalizeFirstLetter(issue.severity)}</div>
                            </div>
                            <div class="issue-description">${issue.description}</div>
                            <div class="issue-impact"><strong>Impact:</strong> ${issue.impact}</div>
                            <div class="issue-recommendation"><strong>Recommendation:</strong> ${issue.recommendation}</div>
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
            <p>Generated by SEO Audit Tool</p>
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
function getDomainFromSummary(summary) {
  if (!summary) return 'Website';
  
  // Try to extract domain name from the summary
  const match = summary.match(/([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/);
  return match ? match[1] : 'Website';
}

function formatDate(dateString) {
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

function getScoreClass(score) {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
