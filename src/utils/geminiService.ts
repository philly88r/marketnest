// This service handles API calls to Google's Gemini API (gemini-2.0-flash)

// Use our local proxy to avoid CORS issues
const API_URL = '/api/gemini/models/gemini-2.0-flash:generateContent';

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  bodyContent: string;
  ctaText: string;
  metaDescription: string;
}

export const generateLandingPageContent = async (prompt: string): Promise<GeneratedContent> => {
  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    };
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract JSON content from the response
    let content: GeneratedContent;
    
    try {
      // Try to extract JSON from the text response
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // If no JSON is found, extract content using regex patterns
        content = {
          headline: extractField(text, 'headline') || 'Compelling Headline for Your Business',
          subheadline: extractField(text, 'subheadline') || 'Engaging subheadline that expands on your value proposition',
          bodyContent: extractField(text, 'bodyContent') || '<p>Detailed content about your business and offerings.</p><p>Highlighting the key benefits and features.</p><p>Convincing customers to take action.</p>',
          ctaText: extractField(text, 'ctaText') || 'Get Started Now',
          metaDescription: extractField(text, 'metaDescription') || 'A concise description of your business landing page for search engines.'
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback content
      content = {
        headline: 'Compelling Headline for Your Business',
        subheadline: 'Engaging subheadline that expands on your value proposition',
        bodyContent: '<p>Detailed content about your business and offerings.</p><p>Highlighting the key benefits and features.</p><p>Convincing customers to take action.</p>',
        ctaText: 'Get Started Now',
        metaDescription: 'A concise description of your business landing page for search engines.'
      };
    }
    
    return content;
  } catch (error) {
    console.error('Error generating content:', error);
    // Return fallback content
    return {
      headline: 'Compelling Headline for Your Business',
      subheadline: 'Engaging subheadline that expands on your value proposition',
      bodyContent: '<p>Detailed content about your business and offerings.</p><p>Highlighting the key benefits and features.</p><p>Convincing customers to take action.</p>',
      ctaText: 'Get Started Now',
      metaDescription: 'A concise description of your business landing page for search engines.'
    };
  }
};

// Helper function to extract fields from text if JSON parsing fails
function extractField(text: string, fieldName: string): string {
  const regex = new RegExp(`${fieldName}[:\\s]+"?([^"\\n]+)"?`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}
