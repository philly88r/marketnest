import { supabase } from './supabaseClient';
import { callGeminiAPI } from './apiProxy';
import { generateAIImage, ImageGenerationOptions } from './imageService';
import { getTemplateByType, EmailTemplateType } from './emailTemplates';

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

// Helper function to save a template to localStorage
export const saveTemplateToLocalStorage = (template: EmailTemplate) => {
  try {
    const clientId = template.client_id;
    const key = `email_templates_${clientId}`;
    
    // Get existing templates
    const existingTemplatesString = localStorage.getItem(key);
    let existingTemplates: EmailTemplate[] = [];
    
    if (existingTemplatesString) {
      try {
        existingTemplates = JSON.parse(existingTemplatesString);
      } catch (e) {
        console.error('Error parsing existing templates from localStorage:', e);
      }
    }
    
    // Check if template already exists (by id)
    const existingIndex = existingTemplates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Update existing template
      existingTemplates[existingIndex] = template;
    } else {
      // Add new template to the beginning of the array
      existingTemplates.unshift(template);
    }
    
    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(existingTemplates));
    console.log(`Saved template to localStorage for client ${clientId}`);
  } catch (e) {
    console.error('Error saving template to localStorage:', e);
  }
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
  status: 'draft' | 'approved' | 'sent' | 'scheduled';
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
  purpose: 'promotional' | 'newsletter' | 'announcement' | 'seasonal' | 'landing-page' | 'personal-touch';
  tone: 'casual' | 'professional' | 'enthusiastic' | 'informative' | 'friendly';
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
  brandColors?: {
    primary: string;
    secondary: string;
    light: string;
    dark: string;
    accent: string;
  }; // Custom brand colors for email templates
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
    const templates = parseAIEmailResponse(aiResponse, options);
    
    // Templates are already processed with brand styling through the template system
    
    // Save the templates to the database
    for (const template of templates) {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .insert(template)
          .select()
          .single();
        
        if (error) {
          console.error('Error saving email template to Supabase:', error);
          // Save to localStorage as backup
          saveTemplateToLocalStorage(template);
        } else if (data) {
          // Save the successfully saved template to localStorage
          saveTemplateToLocalStorage(data);
        }
      } catch (err) {
        console.error('Exception saving email template:', err);
        // Save to localStorage as backup
        saveTemplateToLocalStorage(template);
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
    const parsedTemplate = parseAICustomEmailResponse(aiResponse, options.clientId, templateId);
    
    // Create template data for our responsive email template
    const templateData = {
      title: parsedTemplate.title,
      content: parsedTemplate.content,
      buttonText: 'Read More',
      buttonUrl: '#'
    };
    
    // Use the appropriate template based on the purpose
    const emailContent = getTemplateByType(
      options,
      options.purpose as EmailTemplateType,
      templateData
    );
    
    // Update the template with the new content
    const template = {
      ...parsedTemplate,
      content: emailContent
    };
    
    // Save the template to the database
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single();
      
      if (error) {
        console.error('Error saving custom email template to Supabase:', error);
        // Save to localStorage as backup
        saveTemplateToLocalStorage(template);
      } else if (data) {
        // Save the successfully saved template to localStorage
        saveTemplateToLocalStorage(data);
        return data;
      }
    } catch (err) {
      console.error('Exception saving custom email template:', err);
      // Save to localStorage as backup
      saveTemplateToLocalStorage(template);
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
    console.log('Fetching email templates for client:', clientId);
    
    // Try to get templates from localStorage first as a backup
    const localTemplatesString = localStorage.getItem(`email_templates_${clientId}`);
    let localTemplates: EmailTemplate[] = [];
    
    if (localTemplatesString) {
      try {
        localTemplates = JSON.parse(localTemplatesString);
        console.log(`Found ${localTemplates.length} templates in localStorage for client ${clientId}`);
      } catch (e) {
        console.error('Error parsing local templates:', e);
      }
    }
    
    // Try to get templates from Supabase
    try {
      // Explicitly select all required columns including metrics
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, client_id, title, subject, content, created_at, status, scheduled_for, tags, metrics')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error fetching templates:', error);
        // If there's an error but we have local templates, return those
        if (localTemplates.length > 0) {
          return localTemplates;
        }
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} templates in Supabase for client ${clientId}`);
      console.log('Email template data sample:', data && data.length > 0 ? data[0] : 'No data');
      
      // Process the data to ensure metrics is properly formatted
      const processedData = data?.map(template => {
        // Ensure metrics is parsed if it's a string
        if (template.metrics && typeof template.metrics === 'string') {
          try {
            template.metrics = JSON.parse(template.metrics);
          } catch (e) {
            console.error('Error parsing metrics JSON:', e);
            template.metrics = { opens: 0, clicks: 0, conversions: 0 };
          }
        } else if (!template.metrics) {
          template.metrics = { opens: 0, clicks: 0, conversions: 0 };
        }
        
        // Ensure tags is an array
        if (template.tags && typeof template.tags === 'string') {
          try {
            template.tags = JSON.parse(template.tags);
          } catch (e) {
            console.error('Error parsing tags JSON:', e);
            template.tags = [];
          }
        } else if (!template.tags) {
          template.tags = [];
        }
        
        return template;
      }) || [];
      
      // If we have data from Supabase, update localStorage
      if (processedData && processedData.length > 0) {
        localStorage.setItem(`email_templates_${clientId}`, JSON.stringify(processedData));
        return processedData;
      }
      
      // If no data from Supabase but we have local templates, return those
      if (localTemplates.length > 0) {
        return localTemplates;
      }
      
      // If no templates found anywhere, return an empty array
      return [];
    } catch (err) {
      console.error('Error accessing Supabase:', err);
      
      // If there's an error but we have local templates, return those
      if (localTemplates.length > 0) {
        return localTemplates;
      }
      
      // If all else fails, return an empty array
      return [];
    }
    
    /* Commenting out auth checks temporarily for debugging
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
    */
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return []; // Return empty array instead of throwing to avoid breaking the UI
  }
};

/**
 * Update the status of an email template
 */
export const updateEmailTemplateStatus = async (
  templateId: string,
  status: 'draft' | 'approved' | 'sent' | 'scheduled',
  scheduledDate?: string
): Promise<EmailTemplate> => {
  try {
    const updates: { status: string; scheduled_for?: string } = { status };
    
    if (status === 'scheduled' && scheduledDate) {
      updates.scheduled_for = scheduledDate;
    }
    
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', templateId)
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
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
 * Update an existing email template
 */
export const updateEmailTemplate = async (
  templateId: string,
  updates: Partial<EmailTemplate>
): Promise<EmailTemplate> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', templateId)
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating email template:', error);
    throw error;
  }
};

/**
 * Update email template content using AI
 */
export const updateTemplateWithAI = async (
  templateId: string,
  prompt: string
): Promise<EmailTemplate> => {
  try {
    // First get the current template
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (fetchError || !currentTemplate) {
      throw fetchError || new Error('Template not found');
    }
    
    // Generate new content based on the prompt and current template
    const aiPrompt = `You are an expert email marketer. I have an existing email template with the following content:
        
Title: ${currentTemplate.title}
Subject: ${currentTemplate.subject}
Content: ${currentTemplate.content}

Please update this email template based on the following instructions: ${prompt}

IMPORTANT STYLING REQUIREMENTS:
- This email is for Liberty Beans Coffee ONLY - do NOT use any MarketNest branding or colors
- Use ONLY Liberty Beans colors: primary color #0d233f (dark navy blue) and secondary color #7f2628 (deep burgundy red)
- ALL headers, titles, and text must use ONLY the Liberty Beans colors specified above
- ALL headings must be solid color #0d233f (dark navy blue) or #7f2628 (deep burgundy red), NOT gradients
- DO NOT use any gradient effects, gradient text, or gradient backgrounds anywhere in the email
- DO NOT use any colors other than the Liberty Beans colors specified above for any text or headings
- CRITICAL: Set the style for all h1, h2, h3, h4, h5, h6 elements to use color: #0d233f; or color: #7f2628;
- CRITICAL: Include inline CSS styles for all header elements to ensure they use Liberty Beans colors
- Include Liberty Beans logo at the top of the email with these specifications:
  * Logo path: /images/clients/liberty-beans-logo.png
  * Logo should be small (maximum width: 200px, height: auto)
  * Logo should have a light background (#f8f8f8 or #ffffff)
  * Add padding around the logo (10-15px)
  * Center the logo in a header section

Return the updated template with the same structure as a JSON object:
{
  "title": "Updated title",
  "subject": "Updated subject line",
  "content": "Updated HTML content"
}`;

    // Call the AI API directly using the same method as generateEmailTemplates
    console.log('Calling AI to update template...');
    const aiResponse = await callGeminiAPI(aiPrompt);
    console.log('AI response received for template update');
    
    // Parse the AI response into email templates
    const templateIds = [templateId];
    const templates = parseAIEmailResponse(aiResponse, currentTemplate.client_id, templateIds);
    
    // Apply brand styling to the template
    const processedTemplates = templates.map(template => ({
      ...template,
      content: applyBrandStyles(template.content, { 
        clientId: currentTemplate.client_id,
        clientName: '', // These fields are required by the type but not used in applyBrandStyles
        industry: '',
        purpose: 'promotional' as 'promotional',
        tone: 'professional' as 'professional'
      })
    }));
    
    // Save the templates to the database
    for (const template of processedTemplates) {
      const { error } = await supabase
        .from('email_templates')
        .update(template)
        .eq('id', templateId);
      
      if (error) {
        console.error('Error saving email template:', error);
      }
    }
    
    return processedTemplates[0];
  } catch (error) {
    console.error('Error updating template with AI:', error);
    throw error;
  }
};

/**
 * Generate a prompt for the AI to create email content
 */
const generateEmailPrompt = (options: EmailGenerationOptions, count: number): string => {
  const { clientName, industry, purpose, tone, includePromotion, promotionDetails, includeProductHighlight, productDetails, additionalInstructions } = options;
  
  let prompt = `Generate ${count} high-converting email templates for ${clientName}, a ${industry} company. 
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

  prompt += `\n\nFOLLOW THESE HIGH-CONVERTING EMAIL BEST PRACTICES:
- Create compelling, benefit-focused subject lines (30-50 characters) that create urgency or curiosity
- Open with a personalized greeting and a strong hook in the first paragraph
- Use short paragraphs (2-3 sentences max) with plenty of white space for easy scanning
- Include a clear, compelling call-to-action button that stands out visually (using brand colors)
- Add social proof elements like customer testimonials, reviews, or ratings
- Create a sense of urgency with limited-time offers or countdown timers where appropriate
- Balance promotional content with valuable information that helps the customer
- Include high-quality product images with descriptive alt text
- Add personalized product recommendations when possible
- End with a strong closing statement that reinforces the main benefit
- Keep the overall design clean, mobile-responsive, and on-brand

IMPORTANT STYLING REQUIREMENTS:
- This email is for Liberty Beans Coffee ONLY - do NOT use any MarketNest branding or colors
- Use ONLY Liberty Beans colors: primary color #0d233f (dark navy blue) and secondary color #7f2628 (deep burgundy red)
- ALL headers, titles, and text must use ONLY the Liberty Beans colors specified above
- ALL headings must be solid color #0d233f (dark navy blue) or #7f2628 (deep burgundy red), NOT gradients
- DO NOT use any gradient effects, gradient text, or gradient backgrounds anywhere in the email
- DO NOT use any colors other than the Liberty Beans colors specified above for any text or headings
- CRITICAL: Set the style for all h1, h2, h3, h4, h5, h6 elements to use color: #0d233f; or color: #7f2628;
- CRITICAL: Include inline CSS styles for all header elements to ensure they use Liberty Beans colors
- Include Liberty Beans logo at the top of the email with these specifications:
  * Logo path: /images/clients/liberty-beans-logo.png
  * Logo should be small (maximum width: 200px, height: auto)
  * Logo should have a light background (#f8f8f8 or #ffffff)
  * Add padding around the logo (10-15px)
  * Center the logo in a header section
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
  
  let prompt = `Enhance and format the following content into a high-converting email from ${clientName}, a ${industry} company.
The email should be ${purpose} in nature with a ${tone} tone.

Custom content to enhance:
${customContent}`;

  if (additionalInstructions) {
    prompt += `\n\nAdditional instructions: ${additionalInstructions}`;
  }

  prompt += `\n\nFOLLOW THESE HIGH-CONVERTING EMAIL BEST PRACTICES:
- Create a compelling, benefit-focused subject line (30-50 characters) that creates urgency or curiosity
- Open with a personalized greeting and a strong hook in the first paragraph
- Use short paragraphs (2-3 sentences max) with plenty of white space for easy scanning
- Include a clear, compelling call-to-action button that stands out visually (using brand colors)
- Add social proof elements like customer testimonials, reviews, or ratings
- Create a sense of urgency with limited-time offers or countdown timers where appropriate
- Balance promotional content with valuable information that helps the customer
- Include high-quality product images with descriptive alt text
- Add personalized product recommendations when possible
- End with a strong closing statement that reinforces the main benefit
- Keep the overall design clean, mobile-responsive, and on-brand

IMPORTANT STYLING REQUIREMENTS:
- This email is for Liberty Beans Coffee ONLY - do NOT use any MarketNest branding or colors
- Use ONLY Liberty Beans colors: primary color #0d233f (dark navy blue) and secondary color #7f2628 (deep burgundy red)
- ALL headers, titles, and text must use ONLY the Liberty Beans colors specified above
- ALL headings must be solid color #0d233f (dark navy blue) or #7f2628 (deep burgundy red), NOT gradients
- DO NOT use any gradient effects, gradient text, or gradient backgrounds anywhere in the email
- DO NOT use any colors other than the Liberty Beans colors specified above for any text or headings
- CRITICAL: Set the style for all h1, h2, h3, h4, h5, h6 elements to use color: #0d233f; or color: #7f2628;
- CRITICAL: Include inline CSS styles for all header elements to ensure they use Liberty Beans colors
- Include Liberty Beans logo at the top of the email with these specifications:
  * Logo path: /images/clients/liberty-beans-logo.png
  * Logo should be small (maximum width: 200px, height: auto)
  * Logo should have a light background (#f8f8f8 or #ffffff)
  * Add padding around the logo (10-15px)
  * Center the logo in a header section
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
    
    // Create template data for our responsive email template
    const templateData = {
      title: template.title,
      content: template.content,
      buttonText: 'Learn More',
      buttonUrl: '#'
    };
    
    // Use the appropriate template based on the purpose
    const emailContent = getTemplateByType(
      options,
      'landing-page' as EmailTemplateType,
      templateData
    );
    
    // Update the template with the new content
    template.content = emailContent;
    
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
  options: EmailGenerationOptions,
  templateIds?: string[]
): EmailTemplate[] => {
  // Generate template IDs if not provided
  const ids = templateIds || [
    `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    `email-${Date.now()}-${Math.floor(Math.random() * 1000) + 1}`,
    `email-${Date.now()}-${Math.floor(Math.random() * 1000) + 2}`
  ];
  
  // Get client ID from options
  const clientId = options.clientId;
  try {
    // Handle both response formats (object with text property or direct text string)
    const responseText = typeof response === 'string' ? response : response.text;
    
    if (!responseText) {
      console.error('Empty response from AI:', response);
      throw new Error('Empty response from AI');
    }
    
    console.log('Parsing AI response:', responseText.substring(0, 200) + '...');
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      // Try to find a single JSON object instead of an array
      const singleJsonMatch = responseText.match(/\{\s*"title"[\s\S]*\}/);
      if (singleJsonMatch) {
        // If we found a single object, wrap it in an array
        const template = JSON.parse(singleJsonMatch[0]);
        
        // Create template data for our responsive email template
        const templateData = {
          title: template.title || 'Email Template',
          content: template.content || 'No content',
          buttonText: 'Read More',
          buttonUrl: '#'
        };
        
        // Use the appropriate template based on the purpose
        const emailContent = getTemplateByType(
          options,
          options.purpose as EmailTemplateType,
          templateData
        );
        
        return [{
          id: ids[0],
          client_id: clientId,
          title: template.title || 'Email Template',
          subject: template.subject || 'No subject',
          content: emailContent,
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
      
      // If we can't find JSON, try to parse the response as markdown with sections
      if (responseText.includes('title:') || responseText.includes('Title:')) {
        const templates = [];
        
        // Split the response by markdown code blocks or clear separators
        const templateBlocks = responseText.split(/```json|```|\n---\n|\n\*\*\*\n/).filter(block => 
          block.trim() && (block.includes('title:') || block.includes('Title:'))
        );
        
        for (let i = 0; i < Math.min(templateBlocks.length, templateIds.length); i++) {
          const block = templateBlocks[i];
          
          // Extract title, subject, and content using regex
          const titleMatch = block.match(/(?:title|Title):\s*"?([^"\n]+)"?/i);
          const subjectMatch = block.match(/(?:subject|Subject):\s*"?([^"\n]+)"?/i);
          const contentMatch = block.match(/(?:content|Content):\s*"?([\s\S]+?)(?="?\s*(?:tags|\}|$))/i);
          const tagsMatch = block.match(/(?:tags|Tags):\s*(\[[^\]]+\])/i);
          
          const title = titleMatch ? titleMatch[1].trim() : `Email Template ${i + 1}`;
          const subject = subjectMatch ? subjectMatch[1].trim() : 'Weekly Coffee Update';
          const content = contentMatch ? contentMatch[1].trim() : '<p>Liberty Beans Coffee Newsletter</p>';
          
          let tags = ['email'];
          if (tagsMatch) {
            try {
              tags = JSON.parse(tagsMatch[1]);
            } catch (e) {
              console.error('Error parsing tags:', e);
            }
          }
          
          // Create template data for our responsive email template
          const templateData = {
            title,
            content,
            buttonText: 'Read More',
            buttonUrl: '#'
          };
          
          // Use the appropriate template based on the purpose
          const emailContent = getTemplateByType(
            options,
            options.purpose as EmailTemplateType,
            templateData
          );
          
          templates.push({
            id: ids[i],
            client_id: clientId,
            title,
            subject,
            content: emailContent,
            created_at: new Date().toISOString(),
            status: 'draft',
            tags,
            metrics: {
              opens: 0,
              clicks: 0,
              conversions: 0
            }
          });
        }
        
        if (templates.length > 0) {
          return templates;
        }
      }
      
      console.error('Could not extract JSON from AI response:', responseText);
      throw new Error('Could not extract JSON from AI response');
    }
    
    const jsonStr = jsonMatch[0];
    const templates = JSON.parse(jsonStr);
    
    // Map the parsed templates to our EmailTemplate interface using the new template system
    return templates.map((template: any, index: number) => {
      // Create template data for our responsive email template
      const templateData = {
        title: template.title || `Email Template ${index + 1}`,
        content: template.content || 'No content',
        buttonText: 'Read More',
        buttonUrl: '#'
      };
      
      // Use the appropriate template based on the purpose
      const emailContent = getTemplateByType(
        options,
        options.purpose as EmailTemplateType,
        templateData
      );
      
      return {
        id: ids[index],
        client_id: clientId,
        title: template.title || `Email Template ${index + 1}`,
        subject: template.subject || 'No subject',
        content: emailContent,
        created_at: new Date().toISOString(),
        status: 'draft',
        tags: template.tags || [],
        metrics: {
          opens: 0,
          clicks: 0,
          conversions: 0
        }
      };
    });
  } catch (error) {
    console.error('Error parsing AI email response:', error);
    
    // Return fallback templates using our responsive template system
    return ids.map((id, index) => {
      // Create template data for our responsive email template
      const templateData = {
        title: `Fallback Template ${index + 1}`,
        content: '<p>Error generating email content. Please try again.</p>',
        buttonText: 'Try Again',
        buttonUrl: '#'
      };
      
      // Use the appropriate template based on the purpose
      const emailContent = getTemplateByType(
        options,
        options.purpose as EmailTemplateType,
        templateData
      );
      
      return {
        id,
        client_id: clientId,
        title: `Fallback Template ${index + 1}`,
        subject: 'Weekly Update',
        content: emailContent,
        created_at: new Date().toISOString(),
        status: 'draft',
        tags: ['error'],
        metrics: {
          opens: 0,
          clicks: 0,
          conversions: 0
        }
      };
    });
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

/**
 * Generate a personal touch email template
 * These are brief, casual check-in messages with a personal feel
 */
export const generatePersonalTouchTemplate = async (
  options: EmailGenerationOptions
): Promise<EmailTemplate> => {
  try {
    // Generate a unique ID for the template
    const templateId = `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Generate the prompt for the AI
    const prompt = generatePersonalTouchPrompt(options);
    
    // Call the AI API to generate email content
    const aiResponse = await callGeminiAPI(prompt);
    
    // Parse the AI response into an email template
    const parsedTemplate = parseAIPersonalTouchResponse(aiResponse, options.clientId, templateId);
    
    // Create template data for our responsive email template
    const templateData = {
      greeting: 'Hello',
      message: parsedTemplate.content,
      signature: 'Your friends at ' + options.clientName
    };
    
    // Use the personal touch template
    const emailContent = getTemplateByType(
      options,
      'personal-touch' as EmailTemplateType,
      templateData
    );
    
    // Update the template with the new content
    const template = {
      ...parsedTemplate,
      content: emailContent
    };
    
    // Save the template to the database
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single();
      
      if (error) {
        console.error('Error saving personal touch template to Supabase:', error);
        // Save to localStorage as backup
        saveTemplateToLocalStorage(template);
      } else if (data) {
        // Save the successfully saved template to localStorage
        saveTemplateToLocalStorage(data);
        return data;
      }
    } catch (err) {
      console.error('Exception saving personal touch template:', err);
      // Save to localStorage as backup
      saveTemplateToLocalStorage(template);
    }
    
    return template;
  } catch (error) {
    console.error('Error generating personal touch template:', error);
    throw error;
  }
};

/**
 * Generate a prompt for the AI to create a personal touch email
 */
const generatePersonalTouchPrompt = (options: EmailGenerationOptions): string => {
  const { clientName, industry } = options;
  
  return `
    Create a brief, personal check-in email for a client named ${clientName} in the ${industry} industry. 
    This should be a very short, friendly message (1-2 sentences) that feels like a personal note from a business owner or account manager.
    
    Requirements:
    1. Keep it brief and conversational - no more than 2-3 sentences
    2. Make it feel authentic and personal, not corporate
    3. Include a casual check-in about their well-being
    4. Subtly mention your product/service without being salesy
    5. End with an open-ended question to encourage response
    6. Use a friendly, warm tone
    7. Vary the approach - don't use the same template formula every time
    8. Subject line should be casual and personal
    
    Format your response as a JSON object with the following structure:
    {
      "title": "Personal Check-in",
      "subject": "Quick hello from [Your Name]",
      "content": "<p>The email content goes here.</p>",
      "tags": ["personal", "check-in"]
    }
  `;
};

/**
 * Parse the AI response for a personal touch email template
 */
const parseAIPersonalTouchResponse = (
  response: any, 
  clientId: string,
  templateId: string
): EmailTemplate => {
  try {
    // Extract the JSON from the response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/g);
    
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }
    
    const jsonStr = jsonMatch[0];
    const template = JSON.parse(jsonStr);
    
    // Map the parsed template to our EmailTemplate interface
    return {
      id: templateId,
      client_id: clientId,
      title: template.title || 'Personal Check-in',
      subject: template.subject || 'Quick hello',
      content: template.content || '<p>Hello! Just wanted to check in and see how you are doing. Let me know if you need anything!</p>',
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: template.tags || ['personal', 'check-in'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    };
  } catch (error) {
    console.error('Error parsing AI personal touch response:', error);
    
    // Return fallback template if parsing fails
    return {
      id: templateId,
      client_id: clientId,
      title: 'Personal Check-in',
      subject: 'Quick hello',
      content: '<p>Hello! Just wanted to check in and see how you are doing. Let me know if you need anything!</p>',
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['personal', 'check-in'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    };
  }
};

/**
 * Apply custom brand styling to email content
 * This ensures all headers use the correct brand colors and removes any gradient styling
 */
const applyBrandStyles = (content: string, options: EmailGenerationOptions): string => {
  if (!content) return content;
  
  // Get the brand colors, either from options or default to Liberty Beans
  const brandColors = options.brandColors || getBrandColors(options.clientId);
  const primaryColor = brandColors.primary;
  const secondaryColor = brandColors.secondary;
  
  console.log(`Applying brand styling with primary color: ${primaryColor}`);
  
  // Replace any gradient styling with solid brand colors
  let processedContent = content;
  
  // Remove any background-image or gradient properties
  processedContent = processedContent.replace(/background-image\s*:\s*[^;]*gradient[^;]*;/gi, '');
  processedContent = processedContent.replace(/background\s*:\s*[^;]*gradient[^;]*;/gi, '');
  
  // Replace any -webkit-background-clip: text and other gradient text effects
  processedContent = processedContent.replace(/-webkit-background-clip\s*:\s*text\s*;/gi, '');
  processedContent = processedContent.replace(/-webkit-text-fill-color\s*:\s*transparent\s*;/gi, '');
  
  // Add brand colors to all heading elements
  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  
  headingTags.forEach(tag => {
    // Find all instances of the tag
    const tagRegex = new RegExp(`<${tag}([^>]*)>`, 'gi');
    
    // Replace with tag that has brand styling
    processedContent = processedContent.replace(tagRegex, (match, attributes) => {
      // Check if style attribute exists
      if (attributes.includes('style="')) {
        // Add color property to existing style attribute
        return match.replace(/style="([^"]*)"/i, (styleMatch, styleContent) => {
          // Remove any existing color property
          const cleanedStyle = styleContent.replace(/color\s*:[^;]*;?/gi, '');
          // Add brand color
          return `style="${cleanedStyle}; color: ${primaryColor};"`;
        });
      } else {
        // Add style attribute with color property
        return `<${tag}${attributes} style="color: ${primaryColor};">`;
      }
    });
  });
  
  // Also process span elements that might contain heading text
  processedContent = processedContent.replace(/<span([^>]*)>([^<]*)<\/span>/gi, (match, attributes, spanContent) => {
    // If the span has font-weight: bold or similar properties, apply brand styling
    if (attributes.includes('font-weight') || attributes.includes('strong') || attributes.includes('bold')) {
      if (attributes.includes('style="')) {
        return match.replace(/style="([^"]*)"/i, (styleMatch, styleContent) => {
          // Remove any existing color property
          const cleanedStyle = styleContent.replace(/color\s*:[^;]*;?/gi, '');
          // Add brand color
          return `style="${cleanedStyle}; color: ${primaryColor};"`;
        });
      } else {
        return `<span${attributes} style="color: ${primaryColor};">${spanContent}</span>`;
      }
    }
    return match;
  });
  
  // Add brand color to buttons and links
  processedContent = processedContent.replace(/<a([^>]*)>/gi, (match, attributes) => {
    if (attributes.includes('style="')) {
      return match.replace(/style="([^"]*)"/i, (styleMatch, styleContent) => {
        // Remove any existing color property
        const cleanedStyle = styleContent.replace(/color\s*:[^;]*;?/gi, '');
        // Add brand color
        return `style="${cleanedStyle}; color: ${secondaryColor};"`;
      });
    } else {
      return `<a${attributes} style="color: ${secondaryColor};">`;
    }
  });
  
  // Style buttons with brand colors
  processedContent = processedContent.replace(/<button([^>]*)>/gi, (match, attributes) => {
    if (attributes.includes('style="')) {
      return match.replace(/style="([^"]*)"/i, (styleMatch, styleContent) => {
        // Remove any existing background-color and color properties
        const cleanedStyle = styleContent
          .replace(/background-color\s*:[^;]*;?/gi, '')
          .replace(/color\s*:[^;]*;?/gi, '');
        // Add brand colors
        return `style="${cleanedStyle}; background-color: ${primaryColor}; color: ${brandColors.light};"`;
      });
    } else {
      return `<button${attributes} style="background-color: ${primaryColor}; color: ${brandColors.light};">`;
    }
  });
  
  console.log('Brand styles applied successfully');
  return processedContent;
};
