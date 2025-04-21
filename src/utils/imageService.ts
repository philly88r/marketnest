import { supabase } from './supabaseClient';

/**
 * Interface for image generation options
 */
export interface ImageGenerationOptions {
  prompt: string;
  sampleCount?: number;
  clientId?: string;
  width?: number;
  height?: number;
}

/**
 * Interface for generated image
 */
export interface GeneratedImage {
  id: string;
  client_id: string;
  prompt: string;
  image_url: string;
  created_at: string;
  width: number;
  height: number;
}

/**
 * Generate images using Google's AI image generator
 */
export const generateAIImage = async (options: ImageGenerationOptions): Promise<GeneratedImage> => {
  try {
    const {
      prompt,
      sampleCount = 1,
      clientId,
      width = 1024,
      height = 768
    } = options;

    // Generate a unique ID for the image
    const imageId = `image-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Get environment variables
    const LOCATION = process.env.REACT_APP_GOOGLE_AI_LOCATION || 'us-central1';
    const PROJECT_ID = process.env.REACT_APP_GOOGLE_AI_PROJECT_ID;
    const MODEL_VERSION = process.env.REACT_APP_GOOGLE_AI_MODEL_VERSION || 'imagegeneration@002';
    
    // Prepare the API request
    const apiUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_VERSION}:predict`;
    
    // Get the access token from the server (this should be handled by your backend)
    const response = await fetch('/api/get-google-access-token');
    const { accessToken } = await response.json();
    
    if (!accessToken) {
      throw new Error('Failed to get access token for Google AI API');
    }
    
    // Make the API request
    const imageResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [
          {
            prompt
          }
        ],
        parameters: {
          sampleCount,
          width,
          height
        }
      })
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to generate image: ${imageResponse.statusText}`);
    }
    
    const imageData = await imageResponse.json();
    
    // Extract the image URL from the response
    // Note: The actual response structure may vary, adjust as needed
    const imageUrl = imageData.predictions[0].image_url;
    
    // Save the image to the database
    const generatedImage: GeneratedImage = {
      id: imageId,
      client_id: clientId || 'unknown',
      prompt,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      width,
      height
    };
    
    // Store in database
    if (clientId) {
      const { error } = await supabase
        .from('generated_images')
        .insert(generatedImage);
      
      if (error) {
        console.error('Error saving generated image:', error);
      }
    }
    
    return generatedImage;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

/**
 * Get images generated for a client
 */
export const getGeneratedImagesByClientId = async (clientId: string): Promise<GeneratedImage[]> => {
  try {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching generated images:', error);
    throw error;
  }
};

/**
 * Delete a generated image
 */
export const deleteGeneratedImage = async (imageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting generated image:', error);
    throw error;
  }
};
