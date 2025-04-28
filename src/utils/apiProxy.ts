import { supabase } from './supabaseClient';

/**
 * Proxy for making API calls to external services that may have CORS restrictions
 * This uses Supabase Edge Functions as a proxy
 */

/**
 * Makes a request to the Gemini API through a Supabase Edge Function proxy
 * If the proxy fails, falls back to direct API call
 * @param prompt The prompt to send to Gemini
 * @returns The response from Gemini
 */
export const callGeminiAPI = async (prompt: string): Promise<any> => {
  try {
    console.log('Calling Gemini API through Supabase proxy...');
    
    // Call the Supabase Edge Function that will proxy the request to Gemini
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: {
        prompt,
        model: 'gemini-2.0-flash',
        apiKey: process.env.REACT_APP_GEMINI_API_KEY,
        maxTokens: 8192,
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    });
    
    if (error) {
      console.error('Error calling Gemini API through proxy:', error);
      console.log('Falling back to direct Gemini API call...');
      return await callGeminiAPIDirect(prompt);
    }
    
    return data;
  } catch (error) {
    console.error('Error in callGeminiAPI:', error);
    console.log('Falling back to direct Gemini API call...');
    return await callGeminiAPIDirect(prompt);
  }
};

/**
 * Makes a direct request to the Gemini API
 * Used as a fallback when the proxy fails
 * @param prompt The prompt to send to Gemini
 * @returns The response from Gemini
 */
const callGeminiAPIDirect = async (prompt: string): Promise<any> => {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not defined');
    }

    // Use the gemini-2.0-flash model that is known to work
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
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
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the text from the Gemini response
    const text = data.candidates[0].content.parts[0].text;
    
    // Return the raw text instead of an object to match what the email service expects
    return text;
  } catch (error) {
    console.error('Error in direct Gemini API call:', error);
    throw error;
  }
};

/**
 * Makes a request to analyze a URL for SEO purposes
 * First tries the local server API endpoint, then falls back to Supabase Edge Function
 * @param url The URL to analyze
 * @returns Website data for SEO analysis
 */
export const analyzeWebsite = async (url: string): Promise<any> => {
  try {
    // First try to use the local server API endpoint
    console.log(`Analyzing website: ${url} using local server API...`);
    
    // Create the API endpoint URL
    const apiEndpoint = `/api/seo/crawl?url=${encodeURIComponent(url)}`;
    console.log(`Calling API endpoint: ${apiEndpoint}`);
    
    // Add a timeout to prevent hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server API error: ${response.status} ${response.statusText}`);
      }
      
      // Try to parse the response as JSON
      const responseText = await response.text();
      console.log(`Received response with length: ${responseText.length} characters`);
      console.log(`First 100 characters: ${responseText.substring(0, 100)}`);
      
      try {
        const data = JSON.parse(responseText);
        console.log('Successfully parsed JSON response from local server');
        return data;
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('First 200 characters of response:', responseText.substring(0, 200));
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
    } catch (localApiError) {
      // If local API fails, try Supabase Edge Function as fallback
      console.error('Error using local API:', localApiError);
      console.log('Falling back to Supabase Edge Function...');
      
      // Call the Supabase Edge Function that will analyze the website
      const { data, error } = await supabase.functions.invoke('website-analyzer', {
        body: { url }
      });
      
      if (error) {
        console.error('Error analyzing website through Supabase proxy:', error);
        throw new Error(`Proxy error: ${error.message}`);
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error in analyzeWebsite:', error);
    throw error;
  }
};
