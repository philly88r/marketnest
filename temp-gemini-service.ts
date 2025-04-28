// This service handles API calls to Google's Gemini API (gemini-2.0-flash)

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  bodyContent: string;
  ctaText: string;
  metaDescription: string;
}

export const generateLandingPageContent = async (prompt: string): Promise<GeneratedContent> => {
  try {
    // Replace with your actual API endpoint configuration
    const API_URL = process.env.NEXT_PUBLIC_GEMINI_API_URL || 
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // The API key would be stored as an environment variable
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
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
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
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
    // This assumes the AI will return a properly formatted JSON object
    // You might need additional parsing logic depending on the actual response
    
    let content: GeneratedContent;
    
    try {
      // Try to parse the response as JSON
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Find JSON in the response (it might be mixed with explanatory text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON structure is found, try to extract content manually
        content = {
          headline: extractField(responseText, 'headline'),
          subheadline: extractField(responseText, 'subheadline'),
          bodyContent: extractField(responseText, 'bodyContent'),
          ctaText: extractField(responseText, 'ctaText'),
          metaDescription: extractField(responseText, 'metaDescription')
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback with empty values
      content = {
        headline: '',
        subheadline: '',
        bodyContent: '',
        ctaText: '',
        metaDescription: ''
      };
    }
    
    return content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

// Helper function to extract fields from text if JSON parsing fails
const extractField = (text: string, fieldName: string): string => {
  const regex = new RegExp(`${fieldName}[:\\s]+"?([^"\\n]+)"?`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};
