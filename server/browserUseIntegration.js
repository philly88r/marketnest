/**
 * Browser Use Integration for MarketNest Agency Website
 * 
 * This module provides integration with Browser Use API to enable AI-powered web browsing
 * for content research and generation using Gemini 2.5 Pro.
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Browser Use API configuration
const BROWSER_USE_API_URL = 'https://api.browser-use.com/api/v1';
const BROWSER_USE_API_KEY = process.env.BROWSER_USE_API_KEY; // Add this to your .env file

// Gemini API configuration (reusing from aiContentGenerator)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

/**
 * Create a new browser automation task
 * @param {string} instructions - The natural language instructions for the browser task
 * @returns {Promise<string>} - Task ID
 */
async function createBrowserTask(instructions) {
  try {
    if (!BROWSER_USE_API_KEY) {
      throw new Error('BROWSER_USE_API_KEY is not defined in environment variables');
    }

    const response = await fetch(`${BROWSER_USE_API_URL}/run-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BROWSER_USE_API_KEY}`
      },
      body: JSON.stringify({
        task: instructions
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Browser Use API error:', errorData);
      throw new Error(`Browser Use API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating browser task:', error);
    throw error;
  }
}

/**
 * Get the status of a browser task
 * @param {string} taskId - The task ID
 * @returns {Promise<object>} - Task status
 */
async function getBrowserTaskStatus(taskId) {
  try {
    if (!BROWSER_USE_API_KEY) {
      throw new Error('BROWSER_USE_API_KEY is not defined in environment variables');
    }

    const response = await fetch(`${BROWSER_USE_API_URL}/task/${taskId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BROWSER_USE_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Browser Use API error:', errorData);
      throw new Error(`Browser Use API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting browser task status:', error);
    throw error;
  }
}

/**
 * Get the details of a browser task
 * @param {string} taskId - The task ID
 * @returns {Promise<object>} - Task details
 */
async function getBrowserTaskDetails(taskId) {
  try {
    if (!BROWSER_USE_API_KEY) {
      throw new Error('BROWSER_USE_API_KEY is not defined in environment variables');
    }

    const response = await fetch(`${BROWSER_USE_API_URL}/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BROWSER_USE_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Browser Use API error:', errorData);
      throw new Error(`Browser Use API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting browser task details:', error);
    throw error;
  }
}

/**
 * Generate content using Gemini 2.5 Pro with research data
 * @param {string} prompt - The content generation prompt
 * @param {string} researchData - The research data from Browser Use
 * @returns {Promise<string>} - Generated content
 */
async function generateContentWithResearch(prompt, researchData) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('REACT_APP_GEMINI_API_KEY is not defined in environment variables');
    }

    const enhancedPrompt = `
Research Data:
${researchData}

Based on the above research, ${prompt}

Please format the content professionally with proper headings, paragraphs, and formatting.
`;

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
                text: enhancedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192
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
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
}

/**
 * Express route handler for initiating a web research task
 */
async function startWebResearch(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    const instructions = `Research the following topic thoroughly: ${query}. 
    Visit multiple authoritative websites to gather comprehensive information. 
    Extract key facts, statistics, expert opinions, and recent developments. 
    Organize the information in a structured format that can be used for content creation.`;

    const taskId = await createBrowserTask(instructions);
    return res.json({ taskId });
  } catch (error) {
    console.error('Error starting web research:', error);
    return res.status(500).json({ error: 'Failed to start web research: ' + error.message });
  }
}

/**
 * Express route handler for checking the status of a web research task
 */
async function checkWebResearchStatus(req, res) {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: 'Missing taskId parameter' });
    }

    const status = await getBrowserTaskStatus(taskId);
    return res.json(status);
  } catch (error) {
    console.error('Error checking web research status:', error);
    return res.status(500).json({ error: 'Failed to check web research status: ' + error.message });
  }
}

/**
 * Express route handler for getting the results of a web research task
 */
async function getWebResearchResults(req, res) {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: 'Missing taskId parameter' });
    }

    const details = await getBrowserTaskDetails(taskId);
    return res.json(details);
  } catch (error) {
    console.error('Error getting web research results:', error);
    return res.status(500).json({ error: 'Failed to get web research results: ' + error.message });
  }
}

/**
 * Express route handler for generating content with web research
 */
async function generateContentWithWebResearch(req, res) {
  try {
    const { prompt, researchData } = req.body;

    if (!prompt || !researchData) {
      return res.status(400).json({ error: 'Missing required parameters: prompt and researchData' });
    }

    const generatedContent = await generateContentWithResearch(prompt, researchData);
    return res.json({ content: generatedContent });
  } catch (error) {
    console.error('Error generating content with web research:', error);
    return res.status(500).json({ error: 'Failed to generate content: ' + error.message });
  }
}

module.exports = {
  startWebResearch,
  checkWebResearchStatus,
  getWebResearchResults,
  generateContentWithWebResearch
};
