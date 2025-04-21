// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/supabase-functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

/**
 * This function serves as a proxy for the Gemini API to avoid CORS issues
 * It takes a request with a prompt and forwards it to the Gemini API
 */
serve(async (req) => {
  try {
    // Parse the request body
    const { prompt, model, apiKey, maxTokens, temperature, topP, topK } = await req.json();
    
    // Validate required parameters
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Default values
    const geminiModel = model || "gemini-2.5-flash-preview-04-17";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
    
    // Make the request to Gemini API
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: temperature || 0.2,
          topP: topP || 0.8,
          topK: topK || 40,
          maxOutputTokens: maxTokens || 8192
        }
      }),
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
