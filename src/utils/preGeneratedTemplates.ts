import { EmailTemplate } from './emailService';

/**
 * Pre-generated email templates that can be used without calling the AI API
 * These templates are organized by category and purpose
 */

// Template categories
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
}

/**
 * Get template categories
 * @returns Array of template categories
 */
export const getTemplateCategories = (): TemplateCategory[] => {
  return [
    {
      id: 'welcome',
      name: 'Welcome',
      description: 'Templates for welcoming new subscribers or customers'
    },
    {
      id: 'promotional',
      name: 'Promotional',
      description: 'Templates for promoting products, services, or special offers'
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      description: 'Templates for regular newsletters and updates'
    },
    {
      id: 'announcement',
      name: 'Announcement',
      description: 'Templates for announcing news, events, or product launches'
    },
    {
      id: 'personal',
      name: 'Personal Touch',
      description: 'Templates for personal communication with customers'
    },
    {
      id: 'thank-you',
      name: 'Thank You',
      description: 'Templates for expressing gratitude to customers'
    }
  ];
};

// Generate a unique ID for templates
const generateTemplateId = () => `template-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Get pre-generated templates for a specific client
 * @param clientId The client ID
 * @returns Array of pre-generated email templates
 */
export const getPreGeneratedTemplates = (clientId: string): EmailTemplate[] => {
  return [
    // Welcome Templates
    {
      id: generateTemplateId(),
      client_id: clientId,
      title: 'Welcome New Subscribers',
      subject: 'Welcome to Our Community!',
      content: `
        <h1>Welcome to Our Community!</h1>
        <p>Thank you for subscribing to our newsletter. We're excited to have you join our community!</p>
        <p>Here's what you can expect from us:</p>
        <ul>
          <li>Weekly updates on new products and services</li>
          <li>Exclusive offers and promotions</li>
          <li>Industry insights and tips</li>
        </ul>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
          <tbody>
            <tr>
              <td align="left">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr>
                      <td><a href="#" target="_blank">Explore Our Website</a></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>The Team</p>
      `,
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['welcome', 'newsletter', 'subscribers'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    },
    
    // Promotional Templates
    {
      id: generateTemplateId(),
      client_id: clientId,
      title: 'Summer Sale Announcement',
      subject: 'Summer Sale: Up to 50% Off!',
      content: `
        <h1>Summer Sale is Here!</h1>
        <p>Enjoy up to 50% off on all our products for a limited time.</p>
        <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2>Special Offer</h2>
          <p>Use code: <strong>SUMMER2025</strong> for an extra 10% off your purchase!</p>
          <p>Valid until June 30, 2025</p>
        </div>
        <h3>Featured Products</h3>
        <div style="margin-bottom: 20px;">
          <h4>Product 1</h4>
          <p>Description of product 1 with its amazing features.</p>
          <p><strong>Now only $49.99</strong> (Regular price: $99.99)</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h4>Product 2</h4>
          <p>Description of product 2 with its amazing features.</p>
          <p><strong>Now only $29.99</strong> (Regular price: $59.99)</p>
        </div>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
          <tbody>
            <tr>
              <td align="left">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr>
                      <td><a href="#" target="_blank">Shop Now</a></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      `,
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['promotional', 'sale', 'summer'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    },
    
    // Newsletter Templates
    {
      id: generateTemplateId(),
      client_id: clientId,
      title: 'Monthly Newsletter',
      subject: 'Your Monthly Update - May 2025',
      content: `
        <h1>Monthly Newsletter - May 2025</h1>
        <p>Here's what's been happening this month:</p>
        
        <h2>Company Updates</h2>
        <p>We're excited to announce the launch of our new website! Check it out and let us know what you think.</p>
        
        <h2>Industry News</h2>
        <p>The latest trends in our industry show a shift towards more sustainable practices. We're proud to be leading this change with our eco-friendly initiatives.</p>
        
        <h2>Upcoming Events</h2>
        <ul>
          <li>June 15: Webinar on industry best practices</li>
          <li>June 22: Product demonstration</li>
          <li>July 5: Customer appreciation day</li>
        </ul>
        
        <h2>Featured Article</h2>
        <p><strong>How to Maximize Your Results</strong></p>
        <p>In this article, we share tips and tricks to help you get the most out of our products and services.</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
          <tbody>
            <tr>
              <td align="left">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr>
                      <td><a href="#" target="_blank">Read More</a></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      `,
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['newsletter', 'monthly', 'updates'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    },
    
    // Announcement Templates
    {
      id: generateTemplateId(),
      client_id: clientId,
      title: 'New Product Launch',
      subject: 'Introducing Our Latest Innovation!',
      content: `
        <h1>Introducing Our Latest Innovation!</h1>
        <p>We're thrilled to announce the launch of our newest product, designed to revolutionize your experience.</p>
        
        <h2>Key Features</h2>
        <ul>
          <li><strong>Feature 1:</strong> Description of amazing feature 1</li>
          <li><strong>Feature 2:</strong> Description of amazing feature 2</li>
          <li><strong>Feature 3:</strong> Description of amazing feature 3</li>
        </ul>
        
        <p>Our new product will be available starting June 15, 2025.</p>
        
        <h2>Early Bird Offer</h2>
        <p>Pre-order now and get 15% off the regular price!</p>
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
          <tbody>
            <tr>
              <td align="left">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr>
                      <td><a href="#" target="_blank">Pre-Order Now</a></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      `,
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['announcement', 'product launch', 'new product'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    },
    
    // Personal Touch Templates
    {
      id: generateTemplateId(),
      client_id: clientId,
      title: 'Customer Check-In',
      subject: 'Just Checking In - How Are You?',
      content: `
        <p>Hi there,</p>
        <p>I wanted to take a moment to check in and see how you're doing. It's been a while since we last connected, and I hope everything is going well for you.</p>
        <p>If there's anything we can help you with or if you have any questions about our products or services, please don't hesitate to reach out.</p>
        <p>Looking forward to hearing from you!</p>
        <p>Best regards,<br>Your Account Manager</p>
      `,
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['personal', 'check-in', 'follow-up'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    },
    
    // Thank You Templates
    {
      id: generateTemplateId(),
      client_id: clientId,
      title: 'Thank You for Your Purchase',
      subject: 'Thank You for Your Recent Purchase!',
      content: `
        <h1>Thank You for Your Purchase!</h1>
        <p>We wanted to take a moment to thank you for your recent purchase. We truly appreciate your business and trust in our products.</p>
        
        <h2>Order Details</h2>
        <p>Order #: [Order Number]<br>
        Date: [Order Date]</p>
        
        <p>Your order is being processed and will be shipped soon. You'll receive a shipping confirmation with tracking information once it's on its way.</p>
        
        <h2>Need Help?</h2>
        <p>If you have any questions about your order or need assistance, our customer support team is here to help.</p>
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
          <tbody>
            <tr>
              <td align="left">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr>
                      <td><a href="#" target="_blank">Contact Support</a></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
        
        <p>We hope you enjoy your purchase and look forward to serving you again!</p>
      `,
      created_at: new Date().toISOString(),
      status: 'draft',
      tags: ['thank you', 'purchase', 'confirmation'],
      metrics: {
        opens: 0,
        clicks: 0,
        conversions: 0
      }
    }
  ];
};

// End of file
