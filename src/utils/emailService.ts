import { supabase } from './supabaseClient';
import { callGeminiAPI } from './apiProxy';
import { generateAIImage, ImageGenerationOptions } from './imageService';

// Brand colors for Liberty Beans
export const LIBERTY_BEANS_COLORS = {
  primary: '#0d233f',
  secondary: '#7f2628',
  light: '#ffffff',
  dark: '#000000',
  accent: '#d4a24e' // Gold accent color that complements the primary and secondary colors
};

// Default brand colors (can be customized per client)
export const DEFAULT_BRAND_COLORS = {
  primary: '#1a1a1a',
  secondary: '#3498db',
  light: '#ffffff',
  dark: '#000000',
  accent: '#f39c12'
};

// Client brand colors mapping
export const CLIENT_BRAND_COLORS: {[key: string]: typeof DEFAULT_BRAND_COLORS} = {
  'client-liberty-beans': LIBERTY_BEANS_COLORS,
  // Add more client brand colors here
};

// Get brand colors for a client
export const getBrandColors = (clientId: string) => {
  return CLIENT_BRAND_COLORS[clientId] || DEFAULT_BRAND_COLORS;
};

// Liberty Beans logo path
export const LIBERTY_BEANS_LOGO = '/images/clients/liberty-beans-logo.png';

// Liberty Beans featured products
export const LIBERTY_BEANS_PRODUCTS = [
  {
    name: 'French Vanilla',
    description: 'Our smooth French Vanilla blend offers a delightful balance of rich coffee and creamy vanilla notes.',
    imageUrl: 'https://libertybeanscoffee.com/wp-content/uploads/2023/05/French-Vanilla-Coffee-1-scaled.jpg',
    buyUrl: 'https://libertybeanscoffee.com/product/french-vanilla/'
  },
  {
    name: 'Liberty Blend',
    description: 'Our signature Liberty Blend combines premium beans for a bold, full-bodied flavor with a smooth finish.',
    imageUrl: 'https://libertybeanscoffee.com/wp-content/uploads/2023/05/Liberty-Blend-Coffee-1-scaled.jpg',
    buyUrl: 'https://libertybeanscoffee.com/product/liberty-blend/'
  },
  {
    name: 'Dawn\'s Early Light Compostable Coffee Pods',
    description: 'Eco-friendly compostable pods filled with our premium Dawn\'s Early Light blend for a convenient, sustainable coffee experience.',
    imageUrl: 'https://libertybeanscoffee.com/wp-content/uploads/2023/05/Dawns-Early-Light-Coffee-Pods-1-scaled.jpg',
    buyUrl: 'https://libertybeanscoffee.com/product/dawns-early-light-compostable-coffee-pods/'
  }
];

// Liberty Beans contact and social information
export const LIBERTY_BEANS_CONTACT = {
  address: '1159 Cainhoy Rd Unit D-2, Charleston, SC 29492',
  facebook: 'https://www.facebook.com/LibertyBeansCoffee/',
  instagram: 'https://www.instagram.com/libertybeanscoffee/',
  owners: 'Jim and Diane'
};

// Types for email data
export interface EmailTemplate {
  id: string;
  client_id: string;
  title: string;
  subject: string;
  content: string;
  created_at: string;
  status: 'draft' | 'approved' | 'sent';
  scheduled_for?: string;
  tags: string[];
  metrics?: {
    opens?: number;
    clicks?: number;
    conversions?: number;
  };
}

export interface EmailGenerationOptions {
  clientId: string;
  clientName: string;
  industry: string;
  purpose: 'promotional' | 'newsletter' | 'announcement' | 'seasonal' | 'landing-page';
  tone: 'casual' | 'professional' | 'enthusiastic' | 'informative';
  includePromotion?: boolean;
  promotionDetails?: string;
  includeProductHighlight?: boolean;
  productDetails?: string;
  additionalInstructions?: string;
  customContent?: string; // For "Write with AI" feature
  imagePrompts?: string[]; // For image generation
  isLandingPage?: boolean; // Flag for landing page generation
  landingPageType?: 'product' | 'service' | 'event' | 'lead-generation';
  title?: string; // Title for landing page
  description?: string; // Description for landing page
}

/**
 * Generate email templates using AI
 */
export const generateEmailTemplates = async (
  options: EmailGenerationOptions,
  count: number = 3
): Promise<EmailTemplate[]> => {
  try {
    // Generate a batch of unique IDs for the templates
    const templateIds = Array.from({ length: count }, (_, i) => 
      `email-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`
    );
    
    // Generate the prompt for the AI
    const prompt = generateEmailPrompt(options, count);
    
    // Call the AI API to generate email content
    const aiResponse = await callGeminiAPI(prompt);
    
    // Parse the AI response into email templates
    const templates = parseAIEmailResponse(aiResponse, options.clientId, templateIds);
    
    // Save the templates to the database
    for (const template of templates) {
      const { error } = await supabase
        .from('email_templates')
        .insert(template);
      
      if (error) {
        console.error('Error saving email template:', error);
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Error generating email templates:', error);
    throw error;
  }
};

/**
 * Generate a single email template with custom content using AI
 */
export const generateCustomEmailTemplate = async (
  options: EmailGenerationOptions
): Promise<EmailTemplate> => {
  try {
    // Generate a unique ID for the template
    const templateId = `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Generate the prompt for the AI
    const prompt = generateCustomEmailPrompt(options);
    
    // Call the AI API to generate email content
    const aiResponse = await callGeminiAPI(prompt);
    
    // Parse the AI response
    const template = parseAICustomEmailResponse(aiResponse, options.clientId, templateId);
    
    // Save the template to the database
    const { error } = await supabase
      .from('email_templates')
      .insert(template);
    
    if (error) {
      console.error('Error saving custom email template:', error);
    }
    
    return template;
  } catch (error) {
    console.error('Error generating custom email template:', error);
    throw error;
  }
};

/**
 * Get email templates for a client
 */
export const getEmailTemplatesByClientId = async (clientId: string): Promise<EmailTemplate[]> => {
  try {
    // Get the current user from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }
    
    // Get the user's role from metadata
    const isAdmin = user.user_metadata?.role === 'admin';
    
    // If admin, get all templates for the specified client
    if (isAdmin) {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    }
    
    // For regular clients, check if they're accessing their own data
    // Get the client record associated with this user
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (clientError || !clientData) {
      console.error('Error fetching client data:', clientError);
      return [];
    }
    
    const currentClientId = clientData.id;
    
    // Ensure the client can only access their own templates
    if (currentClientId !== clientId) {
      console.warn(`Client ${currentClientId} attempted to access email templates for client ${clientId}`);
      return [];
    }
    
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return []; // Return empty array instead of throwing to avoid breaking the UI
  }
};

/**
 * Update email template status
 */
export const updateEmailTemplateStatus = async (
  templateId: string, 
  status: 'draft' | 'approved' | 'sent',
  scheduledFor?: string
): Promise<void> => {
  try {
    const updateData: any = { 
      status, 
      scheduled_for: scheduledFor
    };
    
    const { error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', templateId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating email template status:', error);
    throw error;
  }
};

/**
 * Delete an email template
 */
export const deleteEmailTemplate = async (templateId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', templateId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting email template:', error);
    throw error;
  }
};

/**
 * Generate a prompt for the AI to create email content
 */
const generateEmailPrompt = (options: EmailGenerationOptions, count: number): string => {
  const { clientName, industry, purpose, tone, includePromotion, promotionDetails, includeProductHighlight, productDetails, additionalInstructions } = options;
  
  let prompt = `Generate ${count} email templates for ${clientName}, a ${industry} company. 
The emails should be ${purpose} in nature with a ${tone} tone.`;

  if (includePromotion && promotionDetails) {
    prompt += `\nInclude the following promotion: ${promotionDetails}`;
  }

  if (includeProductHighlight && productDetails) {
    prompt += `\nHighlight the following product(s): ${productDetails}`;
  }

  if (additionalInstructions) {
    prompt += `\nAdditional instructions: ${additionalInstructions}`;
  }

  prompt += `\n\nIMPORTANT STYLING REQUIREMENTS:
- This email is for Liberty Beans Coffee ONLY - do NOT use any MarketNest branding or colors
- Use ONLY Liberty Beans colors: primary color #0d233f (dark navy blue) and secondary color #7f2628 (deep burgundy red)
- ALL headers, titles, and text must use ONLY the Liberty Beans colors specified above
- DO NOT use any gradient effects, gradient text, or gradient backgrounds anywhere in the email
- DO NOT use any colors other than the Liberty Beans colors specified above for any text or headings
- ALL headings must be solid color #0d233f (dark navy blue) or #7f2628 (deep burgundy red), NOT gradients

Specific requirements for Liberty Beans Coffee:
- Include their logo at the top of the email (logo path: /images/clients/liberty-beans-logo.png)
- Highlight their premium, ethically sourced coffee beans
- Mention their unique roasting process
- Reference their community involvement and sustainability efforts
- Include the following featured products with images and buy links:
  1. French Vanilla: 
     - Image URL: https://libertybeanscoffee.com/wp-content/uploads/2023/05/French-Vanilla-Coffee-1-scaled.jpg
     - Buy link: https://libertybeanscoffee.com/product/french-vanilla/
  2. Liberty Blend: 
     - Image URL: https://libertybeanscoffee.com/wp-content/uploads/2023/05/Liberty-Blend-Coffee-1-scaled.jpg
     - Buy link: https://libertybeanscoffee.com/product/liberty-blend/
  3. Dawn's Early Light Compostable Coffee Pods: 
     - Image URL: https://libertybeanscoffee.com/wp-content/uploads/2023/05/Dawns-Early-Light-Coffee-Pods-1-scaled.jpg
     - Buy link: https://libertybeanscoffee.com/product/dawns-early-light-compostable-coffee-pods/
- Include a footer with ONLY:
  * Address: 1159 Cainhoy Rd Unit D-2, Charleston, SC 29492
  * Facebook: https://www.facebook.com/LibertyBeansCoffee/
  * Instagram: https://www.instagram.com/libertybeanscoffee/
- IMPORTANT: Add the signature "Jim and Diane" ABOVE the footer, not within the footer. The signature should be separate and appear at the end of the main content.

Format each email template as a JSON object with the following structure:
{
  "title": "Brief descriptive title for internal reference",
  "subject": "Email subject line",
  "content": "Full HTML content of the email using ONLY Liberty Beans brand colors (#0d233f and #7f2628)",
  "tags": ["tag1", "tag2"]
}

The HTML content should:
1. Use responsive design principles
2. Include Liberty Beans logo at the top of the email
3. Use ONLY Liberty Beans branding with their colors (#0d233f and #7f2628)
4. Have a professional, clean layout with NO GRADIENT TEXT - use solid colors only
5. All headings and titles must be solid color #0d233f or #7f2628, NOT gradients
6. Feature the products with the correct image URLs and buy buttons
7. Have a clear call-to-action button
8. End the main content with the signature "Jim and Diane" (NOT in the footer)
9. Include the footer with address and social media links AFTER the signature

Return ${count} templates in a JSON array.`;

  return prompt;
};

/**
 * Generate a prompt for the AI to enhance custom content
 */
const generateCustomEmailPrompt = (options: EmailGenerationOptions): string => {
  const { clientName, industry, purpose, tone, customContent, additionalInstructions } = options;
  
  if (!customContent) {
    throw new Error('Custom content is required for custom email generation');
  }
  
  let prompt = `Enhance and format the following content for an email from ${clientName}, a ${industry} company.
The email should be ${purpose} in nature with a ${tone} tone.

Custom content to enhance:
${customContent}`;

  if (additionalInstructions) {
    prompt += `\n\nAdditional instructions: ${additionalInstructions}`;
  }

  prompt += `\n\nIMPORTANT STYLING REQUIREMENTS:
- This email is for Liberty Beans Coffee ONLY - do NOT use any MarketNest branding or colors
- Use ONLY Liberty Beans colors: primary color #0d233f (dark navy blue) and secondary color #7f2628 (deep burgundy red)
- ALL headers, titles, and text must use ONLY the Liberty Beans colors specified above
- DO NOT use any gradient effects, gradient text, or gradient backgrounds anywhere in the email
- DO NOT use any colors other than the Liberty Beans colors specified above for any text or headings
- ALL headings must be solid color #0d233f (dark navy blue) or #7f2628 (deep burgundy red), NOT gradients

Specific requirements for Liberty Beans Coffee:
- Include their logo at the top of the email (logo path: /images/clients/liberty-beans-logo.png)
- Highlight their premium, ethically sourced coffee beans
- Mention their unique roasting process
- Reference their community involvement and sustainability efforts
- Include the following featured products with images and buy links:
  1. French Vanilla: 
     - Image URL: https://libertybeanscoffee.com/wp-content/uploads/2023/05/French-Vanilla-Coffee-1-scaled.jpg
     - Buy link: https://libertybeanscoffee.com/product/french-vanilla/
  2. Liberty Blend: 
     - Image URL: https://libertybeanscoffee.com/wp-content/uploads/2023/05/Liberty-Blend-Coffee-1-scaled.jpg
     - Buy link: https://libertybeanscoffee.com/product/liberty-blend/
  3. Dawn's Early Light Compostable Coffee Pods: 
     - Image URL: https://libertybeanscoffee.com/wp-content/uploads/2023/05/Dawns-Early-Light-Coffee-Pods-1-scaled.jpg
     - Buy link: https://libertybeanscoffee.com/product/dawns-early-light-compostable-coffee-pods/
- Include a footer with ONLY:
  * Address: 1159 Cainhoy Rd Unit D-2, Charleston, SC 29492
  * Facebook: https://www.facebook.com/LibertyBeansCoffee/
  * Instagram: https://www.instagram.com/libertybeanscoffee/
- IMPORTANT: Add the signature "Jim and Diane" ABOVE the footer, not within the footer. The signature should be separate and appear at the end of the main content.

Format the email template as a JSON object with the following structure:
{
  "title": "Brief descriptive title for internal reference",
  "subject": "Email subject line",
  "content": "Full HTML content of the email using ONLY Liberty Beans brand colors (#0d233f and #7f2628)",
  "tags": ["tag1", "tag2"]
}

The HTML content should:
1. Use responsive design principles
2. Include Liberty Beans logo at the top of the email
3. Use ONLY Liberty Beans branding with their colors (#0d233f and #7f2628)
4. Have a professional, clean layout with NO GRADIENT TEXT - use solid colors only
5. All headings and titles must be solid color #0d233f or #7f2628, NOT gradients
6. Incorporate the custom content provided
7. Feature the products with the correct image URLs and buy buttons
8. Have a clear call-to-action button
9. End the main content with the signature "Jim and Diane" (NOT in the footer)
10. Include the footer with address and social media links AFTER the signature

Return the template as a single JSON object.`;

  return prompt;
};

/**
 * Generate a landing page with AI-generated images
 */
export const generateLandingPage = async (
  options: EmailGenerationOptions
): Promise<EmailTemplate> => {
  try {
    // Generate a unique ID for the landing page
    const templateId = `landing-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Set landing page flag
    const landingPageOptions = {
      ...options,
      isLandingPage: true,
      purpose: 'landing-page' as const
    };
    
    // Generate the prompt for the AI
    const prompt = generateLandingPagePrompt(landingPageOptions);
    
    // Call the AI API to generate landing page content
    const aiResponse = await callGeminiAPI(prompt);
    
    // Parse the AI response into a landing page template
    const template = parseAILandingPageResponse(aiResponse, options.clientId, templateId);
    
    // Generate images if image prompts are provided
    if (template.content && options.imagePrompts && options.imagePrompts.length > 0) {
      // Extract image placeholders from the content
      const imagePlaceholders = template.content.match(/\{\{IMAGE_(\d+)\}\}/g) || [];
      
      // Generate images for each placeholder
      for (let i = 0; i < Math.min(imagePlaceholders.length, options.imagePrompts.length); i++) {
        try {
          const imagePrompt = options.imagePrompts[i];
          
          // Generate the image
          const generatedImage = await generateAIImage({
            prompt: imagePrompt,
            clientId: options.clientId,
            width: 1024,
            height: 768
          });
          
          // Replace the placeholder with the image
          template.content = template.content.replace(
            `{{IMAGE_${i + 1}}}`,
            `<img src="${generatedImage.image_url}" alt="${imagePrompt}" class="landing-page-image" />`
          );
        } catch (imageError) {
          console.error(`Error generating image ${i + 1}:`, imageError);
          // Replace with a placeholder if image generation fails
          template.content = template.content.replace(
            `{{IMAGE_${i + 1}}}`,
            `<div class="image-placeholder">Image generation failed</div>`
          );
        }
      }
    }
    
    // Save the template to the database
    const { error } = await supabase
      .from('email_templates')
      .insert(template);
    
    if (error) {
      console.error('Error saving landing page template:', error);
    }
    
    return template;
  } catch (error) {
    console.error('Error generating landing page:', error);
    throw error;
  }
};

/**
 * Generate a prompt for the AI to create landing page content
 */
const generateLandingPagePrompt = (options: EmailGenerationOptions): string => {
  const { clientName, industry, landingPageType = 'lead-generation', customContent, tone } = options;
  
  // Get the brand colors
  const brandColors = getBrandColors(options.clientId);
  
  // Base prompt
  let prompt = `Create an HTML landing page for ${clientName}, a ${industry} business. `;
  
  // Add landing page type
  switch (landingPageType) {
    case 'product':
      prompt += `This is a product landing page that should showcase and sell a specific product. `;
      break;
    case 'service':
      prompt += `This is a service landing page that should promote and explain a specific service offering. `;
      break;
    case 'event':
      prompt += `This is an event landing page that should promote an upcoming event and encourage registrations. `;
      break;
    case 'lead-generation':
    default:
      prompt += `This is a lead generation landing page that should capture visitor information through a form. `;
      break;
  }
  
  // Add tone
  prompt += `The tone should be ${tone}. `;
  
  // Add custom content if provided
  if (customContent) {
    prompt += `Use the following information as the basis for the landing page content: "${customContent}". `;
  }
  
  // Add brand colors
  prompt += `Use the following brand colors in the design: 
    - Primary: ${brandColors.primary}
    - Secondary: ${brandColors.secondary}
    - Accent: ${brandColors.accent}
    - Light: ${brandColors.light}
    - Dark: ${brandColors.dark}
  `;
  
  // Add image placeholders
  prompt += `Include placeholders for images using the format {{IMAGE_1}}, {{IMAGE_2}}, etc. Place these strategically throughout the landing page where images would enhance the content. `;
  
  // Add form
  prompt += `Include a lead capture form with fields for name, email, and any other relevant information. `;
  
  // Add structure instructions
  prompt += `
  The landing page should include:
  1. A compelling headline
  2. Subheadline that explains the value proposition
  3. Key benefits section
  4. Features section
  5. Social proof/testimonials section
  6. Call-to-action buttons
  7. Lead capture form
  8. Footer with contact information
  
  Format the response as a JSON object with the following structure:
  {
    "title": "Landing Page Title",
    "subject": "Meta Description",
    "content": "Full HTML content of the landing page",
    "tags": ["landing-page", "other-relevant-tags"]
  }
  
  The HTML should be clean, responsive, and use modern CSS. Use inline CSS for styling to ensure compatibility.
  `;
  
  return prompt;
};

/**
 * Parse the AI response for a landing page
 */
const parseAILandingPageResponse = (
  response: any, 
  clientId: string,
  templateId: string
): EmailTemplate => {
  try {
    // Handle both response formats (object with text property or direct text string)
    const responseText = typeof response === 'string' ? response : response.text;
    
    if (!responseText) {
      throw new Error('Empty response from AI');
    }
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{\s*"title"[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }
    
    const jsonStr = jsonMatch[0];
    const template = JSON.parse(jsonStr);
    
    // Map the parsed template to our EmailTemplate interface
    return {
      id: templateId,
      client_id: clientId,
      title: template.title || 'Landing Page',
      subject: template.subject || 'Landing Page',
      content: template.content || '<p>Error generating landing page content. Please try again.</p>',
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: [...(template.tags || []), 'landing-page'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    };
  } catch (error) {
    console.error('Error parsing AI landing page response:', error);
    
    // Return fallback template if parsing fails
    return {
      id: templateId,
      client_id: clientId,
      title: 'Landing Page',
      subject: 'Landing Page',
      content: '<p>Error generating landing page content. Please try again.</p>',
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['error', 'landing-page'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    };
  }
};

/**
 * Parse the AI response into email templates
 */
const parseAIEmailResponse = (
  response: any, 
  clientId: string,
  templateIds: string[]
): EmailTemplate[] => {
  try {
    // Handle both response formats (object with text property or direct text string)
    const responseText = typeof response === 'string' ? response : response.text;
    
    if (!responseText) {
      throw new Error('Empty response from AI');
    }
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      // Try to find a single JSON object instead of an array
      const singleJsonMatch = responseText.match(/\{\s*"title"[\s\S]*\}/);
      if (singleJsonMatch) {
        // If we found a single object, wrap it in an array
        const template = JSON.parse(singleJsonMatch[0]);
        return [{
          id: templateIds[0],
          client_id: clientId,
          title: template.title || 'Email Template',
          subject: template.subject || 'No subject',
          content: template.content || 'No content',
          created_at: new Date().toISOString(),
          status: 'draft',
          tags: template.tags || [],
          metrics: {
            opens: 0,
            clicks: 0,
            conversions: 0
          }
        }];
      }
      
      throw new Error('Could not extract JSON from AI response');
    }
    
    const jsonStr = jsonMatch[0];
    const templates = JSON.parse(jsonStr);
    
    // Map the parsed templates to our EmailTemplate interface
    return templates.map((template: any, index: number) => ({
      id: templateIds[index],
      client_id: clientId,
      title: template.title || `Email Template ${index + 1}`,
      subject: template.subject || 'No subject',
      content: template.content || 'No content',
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: template.tags || [],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    }));
  } catch (error) {
    console.error('Error parsing AI email response:', error);
    
    // Return empty templates if parsing fails
    return templateIds.map((id, index) => ({
      id,
      client_id: clientId,
      title: `Fallback Template ${index + 1}`,
      subject: 'Weekly Coffee Update',
      content: '<p>Error generating email content. Please try again.</p>',
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['error'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    }));
  }
};

/**
 * Parse the AI response for a custom email template
 */
const parseAICustomEmailResponse = (
  response: any, 
  clientId: string,
  templateId: string
): EmailTemplate => {
  try {
    // Handle both response formats (object with text property or direct text string)
    const responseText = typeof response === 'string' ? response : response.text;
    
    if (!responseText) {
      throw new Error('Empty response from AI');
    }
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{\s*"title"[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }
    
    const jsonStr = jsonMatch[0];
    const template = JSON.parse(jsonStr);
    
    // Map the parsed template to our EmailTemplate interface
    return {
      id: templateId,
      client_id: clientId,
      title: template.title || 'Custom Email Template',
      subject: template.subject || 'No subject',
      content: template.content || 'No content',
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: template.tags || ['custom'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    };
  } catch (error) {
    console.error('Error parsing AI custom email response:', error);
    
    // Return fallback template if parsing fails
    return {
      id: templateId,
      client_id: clientId,
      title: 'Custom Email Template',
      subject: 'Weekly Coffee Update',
      content: '<p>Error generating custom email content. Please try again.</p>',
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['error', 'custom'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    };
  }
};
