// Interface for AI chat requests
export interface AIChatRequest {
  message: string;
  userId?: string;
  context?: string;
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>;
}

// Interface for AI chat responses
export interface AIChatResponse {
  response: string;
  error?: string;
}

// System prompt that defines the AI assistant's behavior
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

/**
 * Sends a message to the Google Gemini API
 * This uses the same model as the blog writing functionality
 */
export const sendMessageToAI = async (request: AIChatRequest): Promise<AIChatResponse> => {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Gemini API key not found');
      return {
        response: generateFallbackResponse(request.message),
        error: 'API key not configured'
      };
    }
    
    // Prepare prompt for Gemini API
    let promptText = `${SYSTEM_PROMPT}\n\n`;
    
    if (request.context) {
      promptText += `Current context: ${request.context}\n\n`;
    }
    
    // Add conversation history if provided
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      promptText += "Previous conversation:\n";
      for (const msg of request.conversationHistory) {
        promptText += `${msg.role === 'assistant' ? 'AI Assistant' : 'User'}: ${msg.content}\n`;
      }
      promptText += "\n";
    }
    
    // Add current message
    promptText += `User: ${request.message}\n\nAI Assistant:`;
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return {
        response: generateFallbackResponse(request.message),
        error: errorData?.error?.message || 'Error calling Gemini API'
      };
    }
    
    const responseData = await response.json();
    
    // Extract the AI response from Gemini API response
    if (responseData && 
        responseData.candidates && 
        responseData.candidates[0] && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts[0]) {
      return {
        response: responseData.candidates[0].content.parts[0].text.trim()
      };
    } else {
      console.error('Unexpected Gemini API response format:', responseData);
      return {
        response: generateFallbackResponse(request.message),
        error: 'Invalid response format'
      };
    }
  } catch (err) {
    console.error('Exception in AI chat service:', err);
    return {
      response: generateFallbackResponse(request.message),
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
};

/**
 * Fallback AI response generator when the service is unavailable
 * This provides basic responses based on keywords in the user's message
 */
export const generateFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! How can I assist you with your marketing needs today?';
  } else if (lowerMessage.includes('pricing') || lowerMessage.includes('cost')) {
    return 'Our pricing varies based on your specific needs. I can connect you with an account manager to discuss a customized package. Would you like that?';
  } else if (lowerMessage.includes('seo') || lowerMessage.includes('search engine')) {
    return 'Our SEO services include keyword research, on-page optimization, technical SEO, and content strategy. Would you like more details on any specific aspect?';
  } else if (lowerMessage.includes('ppc') || lowerMessage.includes('ads') || lowerMessage.includes('advertising')) {
    return 'Our PPC advertising services cover Google Ads, Facebook Ads, LinkedIn Ads, and more. We handle everything from campaign setup to ongoing optimization.';
  } else if (lowerMessage.includes('social media')) {
    return 'Our social media marketing services include content creation, community management, paid advertising, and analytics reporting across all major platforms.';
  } else if (lowerMessage.includes('website') || lowerMessage.includes('web design')) {
    return 'We offer comprehensive web design and development services, from simple landing pages to complex e-commerce solutions, all optimized for conversions.';
  } else {
    return 'Thank you for your message. Our team will review this and get back to you shortly. Is there anything specific you need help with in the meantime?';
  }
};
