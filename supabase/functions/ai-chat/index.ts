import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Initialize Gemini API key
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define system prompt for the AI assistant
const SYSTEM_PROMPT = `You are an AI assistant for a digital marketing agency. Your role is to help clients with their marketing needs, answer questions about services, and provide helpful information.

Agency Services:
- SEO (Search Engine Optimization)
- PPC (Pay-Per-Click) Advertising
- Social Media Marketing
- Content Marketing
- Email Marketing
- Web Design & Development
- Analytics & Reporting
- Conversion Rate Optimization (CRO)

Be professional, helpful, and concise in your responses. If you don't know something, acknowledge it and offer to connect the client with a human representative.`;

serve(async (req) => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers });
    }

    // Parse request body
    const { message, userId, context } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: { ...headers, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          response: 'AI service is currently unavailable. Please try again later.',
          error: 'Gemini API key not configured' 
        }),
        { headers: { ...headers, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get conversation history if userId is provided
    let conversationHistory = [];
    if (userId) {
      const { data, error } = await supabase
        .from('messages')
        .select('content, sender_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(10);
      
      if (!error && data) {
        conversationHistory = data.map(msg => ({
          role: msg.sender_name === 'AI Assistant' ? 'assistant' : 'user',
          content: msg.content
        }));
      }
    }

    // Prepare prompt for Gemini API
    let promptText = `${SYSTEM_PROMPT}\n\n`;
    
    if (context) {
      promptText += `Current context: ${context}\n\n`;
    }
    
    // Add conversation history to the prompt
    if (conversationHistory.length > 0) {
      promptText += "Previous conversation:\n";
      for (const msg of conversationHistory) {
        promptText += `${msg.role === 'assistant' ? 'AI Assistant' : 'User'}: ${msg.content}\n`;
      }
      promptText += "\n";
    }
    
    // Add current message
    promptText += `User: ${message}\n\nAI Assistant:`;
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }]
        })
      }
    );
    
    const responseData = await response.json();
    
    // Extract the AI response from Gemini API response
    let aiResponse = 'I apologize, but I couldn\'t generate a response at this time.';
    
    if (responseData && 
        responseData.candidates && 
        responseData.candidates[0] && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts[0]) {
      aiResponse = responseData.candidates[0].content.parts[0].text.trim();
    }

    // Save AI response to database if userId is provided
    if (userId) {
      await supabase
        .from('messages')
        .insert({
          user_id: userId,
          content: aiResponse,
          sender_name: 'AI Assistant',
          channel: context?.includes('Channel:') ? context.split('Channel:')[1].trim() : 'general'
        });
    }

    // Return AI response
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...headers, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        response: 'Sorry, an error occurred while processing your request.',
        error: error.message 
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
