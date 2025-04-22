/**
 * Gemini Image Generator for MarketNest Agency Website
 * 
 * This module provides integration with Google's Gemini 2.0 API for image generation
 * capabilities, allowing users to create custom images based on text prompts.
 */

require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Gemini API configuration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_IMAGE_MODEL = 'gemini-2.0-flash-exp'; // Model that supports image generation

// Ensure the uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'generated-images');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Generate an image using Gemini 2.0 Flash
 * @param {string} prompt - The text prompt for image generation
 * @param {Object} options - Additional options for image generation
 * @returns {Promise<Object>} - Generated image information
 */
async function generateImage(prompt, options = {}) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('REACT_APP_GEMINI_API_KEY is not defined in environment variables');
    }

    // Default options
    const defaultOptions = {
      aspectRatio: '1:1',
      numberOfImages: 1,
      safetyFilterLevel: 'BLOCK_NONE', // Options: BLOCK_NONE, BLOCK_ONLY_HIGH, BLOCK_MEDIUM_AND_ABOVE, BLOCK_LOW_AND_ABOVE
      enhancePrompt: true
    };

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };

    // Prepare the request payload
    const payload = {
      model: GEMINI_IMAGE_MODEL,
      prompt: prompt,
      config: {
        responseModalities: ["Text", "Image"], // Include both text and image in response
        aspectRatio: mergedOptions.aspectRatio,
        numberOfImages: mergedOptions.numberOfImages,
        safetyFilterLevel: mergedOptions.safetyFilterLevel,
        enhancePrompt: mergedOptions.enhancePrompt
      }
    };

    // Make the API request
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process the response to extract images and text
    const result = {
      text: null,
      images: []
    };

    // Extract text and images from the response
    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.text) {
          result.text = part.text;
        } else if (part.inlineData) {
          // Generate a unique filename
          const filename = `gemini-image-${uuidv4()}.png`;
          const filepath = path.join(UPLOADS_DIR, filename);
          
          // Save the image to disk
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(filepath, imageBuffer);
          
          // Add image information to the result
          result.images.push({
            filename,
            path: `/uploads/generated-images/${filename}`,
            mimeType: part.inlineData.mimeType
          });
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    throw error;
  }
}

/**
 * Express route handler for generating images
 */
async function handleImageGeneration(req, res) {
  try {
    const { prompt, aspectRatio, numberOfImages, safetyFilterLevel, enhancePrompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    // Prepare options from request
    const options = {};
    if (aspectRatio) options.aspectRatio = aspectRatio;
    if (numberOfImages) options.numberOfImages = parseInt(numberOfImages, 10);
    if (safetyFilterLevel) options.safetyFilterLevel = safetyFilterLevel;
    if (enhancePrompt !== undefined) options.enhancePrompt = enhancePrompt;

    // Generate the image
    const result = await generateImage(prompt, options);
    
    return res.json(result);
  } catch (error) {
    console.error('Error handling image generation:', error);
    return res.status(500).json({ error: 'Failed to generate image: ' + error.message });
  }
}

module.exports = {
  generateImage,
  handleImageGeneration
};
