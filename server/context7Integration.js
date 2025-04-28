/**
 * Context7 MCP Integration for MarketNest Agency Website
 * 
 * This module provides integration with Context7 MCP to fetch up-to-date documentation
 * for the AI-powered features of the MarketNest platform.
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Context7 API configuration
const CONTEXT7_API_URL = 'https://api.context7.com/v1';
const CONTEXT7_API_KEY = process.env.CONTEXT7_API_KEY; // Add this to your .env file

/**
 * Fetch documentation from Context7 for a specific library or framework
 * @param {string} query - The documentation query
 * @param {string} library - The library or framework name (e.g., 'nextjs', 'react')
 * @param {string} version - Optional version specification
 * @returns {Promise<object>} - Documentation data
 */
async function fetchContext7Documentation(query, library, version = 'latest') {
  try {
    if (!CONTEXT7_API_KEY) {
      throw new Error('CONTEXT7_API_KEY is not defined in environment variables');
    }

    const response = await fetch(`${CONTEXT7_API_URL}/documentation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTEXT7_API_KEY}`
      },
      body: JSON.stringify({
        query,
        library,
        version,
        format: 'markdown'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Context7 API error:', errorData);
      throw new Error(`Context7 API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching documentation from Context7:', error);
    throw error;
  }
}

/**
 * Fetch code examples from Context7
 * @param {string} query - The code example query
 * @param {string} language - Programming language (e.g., 'javascript', 'typescript')
 * @returns {Promise<object>} - Code examples data
 */
async function fetchContext7CodeExamples(query, language) {
  try {
    if (!CONTEXT7_API_KEY) {
      throw new Error('CONTEXT7_API_KEY is not defined in environment variables');
    }

    const response = await fetch(`${CONTEXT7_API_URL}/code-examples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTEXT7_API_KEY}`
      },
      body: JSON.stringify({
        query,
        language,
        count: 3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Context7 API error:', errorData);
      throw new Error(`Context7 API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching code examples from Context7:', error);
    throw error;
  }
}

/**
 * Express route handler for Context7 documentation requests
 */
async function getContext7Documentation(req, res) {
  try {
    const { query, library, version } = req.body;

    if (!query || !library) {
      return res.status(400).json({ error: 'Missing required parameters: query and library' });
    }

    const documentation = await fetchContext7Documentation(query, library, version || 'latest');
    return res.json(documentation);
  } catch (error) {
    console.error('Error in Context7 documentation route:', error);
    return res.status(500).json({ error: 'Failed to fetch documentation: ' + error.message });
  }
}

/**
 * Express route handler for Context7 code examples requests
 */
async function getContext7CodeExamples(req, res) {
  try {
    const { query, language } = req.body;

    if (!query || !language) {
      return res.status(400).json({ error: 'Missing required parameters: query and language' });
    }

    const codeExamples = await fetchContext7CodeExamples(query, language);
    return res.json(codeExamples);
  } catch (error) {
    console.error('Error in Context7 code examples route:', error);
    return res.status(500).json({ error: 'Failed to fetch code examples: ' + error.message });
  }
}

module.exports = {
  getContext7Documentation,
  getContext7CodeExamples
};
