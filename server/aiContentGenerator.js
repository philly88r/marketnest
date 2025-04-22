require('dotenv').config();
const fetch = require('node-fetch');

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

/**
 * Call the Google Gemini API directly from the server
 */
async function callGeminiAPI(prompt, maxTokens = 8192) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('REACT_APP_GEMINI_API_KEY is not defined in environment variables');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: maxTokens
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Generate content using AI
 */
async function generateContent(req, res) {
  try {
    const { prompt, maxTokens } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    console.log('Generating content with prompt:', prompt.substring(0, 100) + '...');
    
    // Call the Gemini API
    const generatedText = await callGeminiAPI(prompt, maxTokens || 1000);
    
    // Return the generated content
    return res.json({ text: generatedText });
  } catch (error) {
    console.error('Error generating content with AI:', error);
    return res.status(500).json({ error: 'Failed to generate content: ' + error.message });
  }
}

module.exports = {
  generateContent
};
