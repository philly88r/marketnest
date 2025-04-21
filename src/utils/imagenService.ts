// This service handles API calls to Google's Imagen API

// Use our local proxy to avoid CORS issues
const API_URL = '/api/gemini/models/imagen-3.0:generateImage';

/**
 * Simulates generating an image based on a prompt
 * In a production environment, this would call the Google Imagen API
 * 
 * @param prompt The text prompt to generate an image from
 * @returns A URL to a placeholder image
 */
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    // Using our local proxy to avoid CORS issues
    
    const requestBody = {
      prompt: {
        text: prompt
      },
      responseType: "IMAGE",
      sampleCount: 1,
      sampleImageSize: "1024x1024"
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
    
    // Extract the image data from the response
    const imageData = data.images?.[0]?.data;
    if (imageData) {
      return `data:image/png;base64,${imageData}`;
    } else {
      throw new Error('No image data in response');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    
    // If the API call fails, generate a placeholder based on the prompt
    const encodedPrompt = encodeURIComponent(prompt.substring(0, 30));
    return `https://via.placeholder.com/800x400/cccccc/666666?text=${encodedPrompt}`;
  }
};

/**
 * Generates multiple images from different prompts
 * 
 * @param prompts Array of text prompts
 * @returns Array of image URLs
 */
export const generateImages = async (prompts: string[]): Promise<string[]> => {
  try {
    // Process all prompts in parallel with Promise.all
    const imageUrls = await Promise.all(
      prompts.map(prompt => generateImage(prompt))
    );
    
    return imageUrls;
  } catch (error) {
    console.error('Error generating multiple images:', error);
    
    // If batch generation fails, generate placeholders based on the prompts
    return prompts.map(prompt => {
      const encodedPrompt = encodeURIComponent(prompt.substring(0, 30));
      return `https://via.placeholder.com/800x400/cccccc/666666?text=${encodedPrompt}`;
    });
  }
};
