/**
 * Browser Use Integration for MarketNest Agency Website
 * 
 * This module provides integration with Browser Use API to enable AI-powered web browsing
 * for content research and generation using Gemini models.
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Browser Use API configuration
const BROWSER_USE_API_URL = 'https://api.browser-use.com/api/v1';
const BROWSER_USE_API_KEY = process.env.REACT_APP_BROWSER_USE_API_KEY; // Using the same key from React app

// Gemini API configuration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_RESEARCH_MODEL = 'gemini-2.5-pro-preview-03-25'; // For research with Browser Use
const GEMINI_WRITING_MODEL = 'gemini-2.0-flash-001'; // Correct model name for Gemini 2.0 Flash

/**
 * Create a new browser automation task
 * @param {string} instructions - The natural language instructions for the browser task
 * @returns {Promise<string>} - Task ID
 */
async function createBrowserTask(instructions) {
  try {
    console.log('Creating browser task with instructions:', instructions);
    console.log('Using API URL:', BROWSER_USE_API_URL);
    console.log('API Key defined:', !!BROWSER_USE_API_KEY);

    if (!BROWSER_USE_API_KEY) {
      throw new Error('BROWSER_USE_API_KEY is not defined in environment variables');
    }

    const requestBody = {
      task: instructions,
      model: GEMINI_RESEARCH_MODEL // Use Gemini-2.5-Pro-Preview-03-25 for research
    };
    console.log('Request body:', JSON.stringify(requestBody));

    const response = await fetch(`${BROWSER_USE_API_URL}/run-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BROWSER_USE_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Browser Use API error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Browser Use API error (parsed):', errorData);
      } catch (jsonError) {
        console.error('Could not parse error response as JSON');
      }
      throw new Error(`Browser Use API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
    } catch (jsonError) {
      console.error('Error parsing response as JSON:', jsonError);
      throw new Error('Invalid JSON response from Browser Use API');
    }

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
    console.log(`Checking status for task ID: ${taskId}`);
    console.log('API Key defined:', !!BROWSER_USE_API_KEY);
    
    if (!BROWSER_USE_API_KEY) {
      throw new Error('BROWSER_USE_API_KEY is not defined in environment variables');
    }

    console.log(`Making request to: ${BROWSER_USE_API_URL}/task/${taskId}/status`);
    const response = await fetch(`${BROWSER_USE_API_URL}/task/${taskId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BROWSER_USE_API_KEY}`
      }
    });

    console.log(`Status check response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error checking task status response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Error checking task status (parsed):', errorData);
      } catch (jsonError) {
        console.error('Could not parse error response as JSON');
      }
      throw new Error(`Browser Use API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log(`Task status response text: ${responseText}`);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Task status data:', data);
    } catch (jsonError) {
      console.error('Error parsing task status response as JSON:', jsonError);
      throw new Error('Invalid JSON response from task status API');
    }

    return data;
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
    console.log(`Getting details for task ID: ${taskId}`);
    console.log('API Key defined:', !!BROWSER_USE_API_KEY);
    
    if (!BROWSER_USE_API_KEY) {
      throw new Error('BROWSER_USE_API_KEY is not defined in environment variables');
    }

    console.log(`Making request to: ${BROWSER_USE_API_URL}/task/${taskId}`);
    const response = await fetch(`${BROWSER_USE_API_URL}/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BROWSER_USE_API_KEY}`
      }
    });

    console.log(`Details check response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error getting task details response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Error getting task details (parsed):', errorData);
      } catch (jsonError) {
        console.error('Could not parse error response as JSON');
      }
      throw new Error(`Browser Use API error: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log(`Task details response text (first 200 chars): ${responseText.substring(0, 200)}...`);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Task details data keys:', Object.keys(data));
      if (data.result) {
        console.log('Task result available, length:', data.result.length);
      }
    } catch (jsonError) {
      console.error('Error parsing task details response as JSON:', jsonError);
      throw new Error('Invalid JSON response from task details API');
    }

    return data;
  } catch (error) {
    console.error('Error getting browser task details:', error);
    throw error;
  }
}

/**
 * Generate content using Gemini-2.0-Flash with research data
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

    // Using the correct endpoint format for Gemini-2.0-Flash-001
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_WRITING_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
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
// Store task progress for each task ID
const taskProgress = {};

async function checkWebResearchStatus(req, res) {
  try {
    const { taskId } = req.params;
    console.log('Checking status for task from frontend:', taskId);

    if (!taskId) {
      return res.status(400).json({ error: 'Missing taskId parameter' });
    }

    const status = await getBrowserTaskStatus(taskId);
    
    // Initialize progress tracking for this task if it doesn't exist
    if (!taskProgress[taskId]) {
      taskProgress[taskId] = {
        startTime: Date.now(),
        progress: 0.1 // Start at 10%
      };
    }
    
    // Calculate simulated progress based on time elapsed
    // We'll assume a typical task takes about 3-5 minutes
    if (status === 'running') {
      const elapsed = (Date.now() - taskProgress[taskId].startTime) / 1000; // seconds
      const maxProgress = 0.9; // Max progress while running (90%)
      
      // Gradually increase progress, faster at first then slower
      // This creates a more realistic progress simulation
      if (elapsed < 60) { // First minute
        taskProgress[taskId].progress = Math.min(0.4, 0.1 + (elapsed / 60) * 0.3);
      } else if (elapsed < 180) { // 1-3 minutes
        taskProgress[taskId].progress = Math.min(0.7, 0.4 + ((elapsed - 60) / 120) * 0.3);
      } else { // After 3 minutes
        taskProgress[taskId].progress = Math.min(maxProgress, 0.7 + ((elapsed - 180) / 300) * 0.2);
      }
    } else if (status === 'completed') {
      taskProgress[taskId].progress = 1.0; // 100% when complete
    }
    
    // Format the response to match what the frontend expects
    const formattedStatus = {
      status: status === 'running' ? 'running' : 
              status === 'completed' ? 'finished' : 
              status === 'failed' ? 'failed' : status,
      progress: taskProgress[taskId].progress
    };
    
    console.log(`Sending formatted status to frontend: { status: '${formattedStatus.status}', progress: ${formattedStatus.progress.toFixed(2)} }`);
    return res.json(formattedStatus);
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
    console.log('Getting results for task from frontend:', taskId);

    if (!taskId) {
      return res.status(400).json({ error: 'Missing taskId parameter' });
    }

    // Get the complete task details from BrowserUse API
    const details = await getBrowserTaskDetails(taskId);
    console.log('Got task details, available fields:', Object.keys(details));
    
    // Log a preview of the output field if it exists
    if (details.output) {
      console.log('Output field preview:', details.output.substring(0, 100));
    }
    
    // Log browser_data structure if it exists
    if (details.browser_data) {
      console.log('Browser data fields:', Object.keys(details.browser_data));
    }
    
    // Following the Context7 pattern, return the complete response to the client
    // This allows the client to handle the structure and extract what it needs
    console.log('Sending complete task details to frontend');
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

/**
 * Function to check a specific task status directly
 * @param {string} taskId - The task ID to check
 */
async function checkSpecificTask(taskId) {
  try {
    console.log(`Checking specific task ID: ${taskId}`);
    
    if (!taskId) {
      console.error('No task ID provided');
      return;
    }

    // Check status
    console.log('Checking status...');
    const status = await getBrowserTaskStatus(taskId);
    console.log(`Task status: ${status}`);
    
    // If completed, get details
    if (status === 'completed') {
      console.log('Task completed, getting details...');
      const details = await getBrowserTaskDetails(taskId);
      console.log('Task details:', details);
      if (details.result) {
        console.log('Result preview (first 200 chars):', details.result.substring(0, 200));
      } else {
        console.log('No result available in task details');
      }
    }
  } catch (error) {
    console.error('Error checking specific task:', error);
  }
}

// Check the task that was running for about 10 minutes
checkSpecificTask('a0507963-5645-4a27-bc46-4f86fd88a1d0');

module.exports = {
  startWebResearch,
  checkWebResearchStatus,
  getWebResearchResults,
  generateContentWithWebResearch
};
