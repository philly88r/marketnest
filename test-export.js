// Test script to verify the direct HTML exporter functionality
const { directExportToGoogleDocs } = require('./src/utils/directHtmlExporter');

// Mock SEO audit data with raw JSON response
const mockAudit = {
  url: 'https://libertybeanscoffee.com',
  report: {
    geminiAudit: {
      rawResponse: `\`\`\`json
{
  "overall": {
    "score": 70,
    "summary": "The Liberty Beans Coffee Company website shows a solid foundation for SEO, particularly with HTTPS, basic schema markup, and mobile compatibility.",
    "keyFindings": [
      "Broken internal links to old staging domain",
      "Inconsistent heading structure",
      "Lack of specific e-commerce schema markup"
    ],
    "quickWins": [
      "Fix all internal links pointing to the staging domain",
      "Add unique meta descriptions",
      "Implement descriptive alt text"
    ]
  },
  "pages": [
    {
      "url": "https://libertybeanscoffee.com/",
      "title": "Liberty Beans Coffee Company",
      "score": 78,
      "issues": [
        {
          "title": "Incorrect Internal Links",
          "description": "Links point to old staging domain",
          "priority": 1,
          "recommendation": "Update all links to use the correct domain"
        }
      ]
    }
  ]
}\`\`\``
    }
  }
};

// Test the exporter
try {
  const url = directExportToGoogleDocs(mockAudit);
  console.log('Google Docs URL generated successfully!');
  console.log('URL:', url);
  console.log('Open this URL in your browser to view the exported report');
} catch (error) {
  console.error('Export failed:', error);
}
