import { EmailGenerationOptions } from './emailService';

/**
 * Email template types available in the system
 */
export type EmailTemplateType = 
  | 'simple' 
  | 'newsletter' 
  | 'promotional' 
  | 'welcome' 
  | 'announcement'
  | 'personal-touch';

/**
 * Base template from Lee Munroe's responsive HTML email template
 * This template is responsive and works across all major email clients
 * Source: https://github.com/leemunroe/responsive-html-email-template
 */
export const getBaseTemplate = (options: EmailGenerationOptions): string => {
  // Get brand colors from options or use defaults
  const brandColors = options.brandColors || {
    primary: '#0d233f',
    secondary: '#7f2628',
    light: '#ffffff',
    dark: '#000000',
    accent: '#d4a24e'
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>${options.clientName} - ${options.purpose.charAt(0).toUpperCase() + options.purpose.slice(1).replace('-', ' ')}</title>
    <style media="all" type="text/css">
    /* -------------------------------------
    GLOBAL RESETS
    ------------------------------------- */
    body {
      font-family: Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 16px;
      line-height: 1.3;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
    }
    table td {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      vertical-align: top;
    }
    /* -------------------------------------
    BODY & CONTAINER
    ------------------------------------- */
    body {
      background-color: #f4f5f6;
      margin: 0;
      padding: 0;
    }
    .body {
      background-color: #f4f5f6;
      width: 100%;
    }
    .container {
      margin: 0 auto !important;
      max-width: 600px;
      padding: 0;
      padding-top: 24px;
      width: 600px;
    }
    .content {
      box-sizing: border-box;
      display: block;
      margin: 0 auto;
      max-width: 600px;
      padding: 0;
    }
    /* -------------------------------------
    HEADER, FOOTER, MAIN
    ------------------------------------- */
    .main {
      background: #ffffff;
      border: 1px solid #eaebed;
      border-radius: 16px;
      width: 100%;
    }
    .wrapper {
      box-sizing: border-box;
      padding: 24px;
    }
    .footer {
      clear: both;
      padding-top: 24px;
      text-align: center;
      width: 100%;
    }
    .footer td,
    .footer p,
    .footer span,
    .footer a {
      color: #9a9ea6;
      font-size: 16px;
      text-align: center;
    }
    /* -------------------------------------
    TYPOGRAPHY
    ------------------------------------- */
    h1, h2, h3, h4, h5, h6 {
      color: ${brandColors.primary};
      font-family: Helvetica, sans-serif;
      font-weight: bold;
      margin: 0;
      margin-bottom: 16px;
    }
    p {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      font-weight: normal;
      margin: 0;
      margin-bottom: 16px;
    }
    a {
      color: ${brandColors.secondary};
      text-decoration: underline;
    }
    /* -------------------------------------
    BUTTONS
    ------------------------------------- */
    .btn {
      box-sizing: border-box;
      min-width: 100% !important;
      width: 100%;
    }
    .btn > tbody > tr > td {
      padding-bottom: 16px;
    }
    .btn table {
      width: auto;
    }
    .btn table td {
      background-color: #ffffff;
      border-radius: 4px;
      text-align: center;
    }
    .btn a {
      background-color: #ffffff;
      border: solid 2px ${brandColors.primary};
      border-radius: 4px;
      box-sizing: border-box;
      color: ${brandColors.primary};
      cursor: pointer;
      display: inline-block;
      font-size: 16px;
      font-weight: bold;
      margin: 0;
      padding: 12px 24px;
      text-decoration: none;
      text-transform: capitalize;
    }
    .btn-primary table td {
      background-color: ${brandColors.primary};
    }
    .btn-primary a {
      background-color: ${brandColors.primary};
      border-color: ${brandColors.primary};
      color: ${brandColors.light};
    }
    @media all {
      .btn-primary table td:hover {
        background-color: ${brandColors.secondary} !important;
      }
      .btn-primary a:hover {
        background-color: ${brandColors.secondary} !important;
        border-color: ${brandColors.secondary} !important;
      }
    }
    /* -------------------------------------
    OTHER STYLES THAT MIGHT BE USEFUL
    ------------------------------------- */
    .last {
      margin-bottom: 0;
    }
    .first {
      margin-top: 0;
    }
    .align-center {
      text-align: center;
    }
    .align-right {
      text-align: right;
    }
    .align-left {
      text-align: left;
    }
    .text-link {
      color: ${brandColors.secondary} !important;
      text-decoration: underline !important;
    }
    .clear {
      clear: both;
    }
    .mt0 {
      margin-top: 0;
    }
    .mb0 {
      margin-bottom: 0;
    }
    .preheader {
      color: transparent;
      display: none;
      height: 0;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      mso-hide: all;
      visibility: hidden;
      width: 0;
    }
    .powered-by a {
      text-decoration: none;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo {
      max-width: 200px;
      height: auto;
      padding: 10px;
      background-color: ${brandColors.light};
    }
    /* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
    ------------------------------------- */
    @media only screen and (max-width: 640px) {
      .main p,
      .main td,
      .main span {
        font-size: 16px !important;
      }
      .wrapper {
        padding: 8px !important;
      }
      .content {
        padding: 0 !important;
      }
      .container {
        padding: 0 !important;
        padding-top: 8px !important;
        width: 100% !important;
      }
      .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
      .btn table {
        max-width: 100% !important;
        width: 100% !important;
      }
      .btn a {
        font-size: 16px !important;
        max-width: 100% !important;
        width: 100% !important;
      }
    }
    /* -------------------------------------
    PRESERVE THESE STYLES IN THE HEAD
    ------------------------------------- */
    @media all {
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
    }
    </style>
  </head>
  <body>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">
            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">{{preheader}}</span>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <div class="logo-container">
                    <img src="/images/clients/${options.clientId}-logo.png" alt="${options.clientName} Logo" class="logo">
                  </div>
                  {{content}}
                </td>
              </tr>
              <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">${options.clientName}</span>
                    <br> Don't like these emails? <a href="{{unsubscribe_url}}">Unsubscribe</a>.
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by">
                    Powered by <a href="https://marketnest.agency">MarketNest</a>
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>`;
};

/**
 * Simple transactional email template
 */
export const getSimpleTemplate = (options: EmailGenerationOptions, title: string, content: string, buttonText: string, buttonUrl: string): string => {
  const baseTemplate = getBaseTemplate(options);
  
  const emailContent = `
    <h1>${title}</h1>
    ${content}
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
      <tbody>
        <tr>
          <td align="left">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td> <a href="${buttonUrl}" target="_blank">${buttonText}</a> </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `;
  
  return baseTemplate
    .replace('{{preheader}}', title)
    .replace('{{content}}', emailContent)
    .replace('{{unsubscribe_url}}', '#');
};

/**
 * Newsletter template with multiple sections
 */
export const getNewsletterTemplate = (
  options: EmailGenerationOptions, 
  title: string, 
  intro: string, 
  sections: Array<{title: string, content: string, imageUrl?: string}>,
  buttonText: string,
  buttonUrl: string
): string => {
  const baseTemplate = getBaseTemplate(options);
  
  let sectionsHtml = '';
  if (sections && Array.isArray(sections)) {
    sections.forEach(section => {
      sectionsHtml += `
        <h2 style="color: ${options.brandColors?.primary || '#0d233f'};">${section.title}</h2>
        ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.title}" style="max-width: 100%; height: auto; margin-bottom: 16px;">` : ''}
        ${section.content}
        <hr style="border: 0; border-bottom: 1px solid #eaebed; margin: 20px 0;">
      `;
    });
  } else {
    // Default section if none provided
    sectionsHtml = `
      <h2 style="color: ${options.brandColors?.primary || '#0d233f'};">Latest Updates</h2>
      <p>Stay tuned for our latest updates and news.</p>
      <hr style="border: 0; border-bottom: 1px solid #eaebed; margin: 20px 0;">
    `;
  }
  
  const emailContent = `
    <h1>${title}</h1>
    ${intro}
    ${sectionsHtml}
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
      <tbody>
        <tr>
          <td align="left">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td> <a href="${buttonUrl}" target="_blank">${buttonText}</a> </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `;
  
  return baseTemplate
    .replace('{{preheader}}', title)
    .replace('{{content}}', emailContent)
    .replace('{{unsubscribe_url}}', '#');
};

/**
 * Promotional email template with product highlights
 */
export const getPromotionalTemplate = (
  options: EmailGenerationOptions,
  title: string,
  intro: string,
  products: Array<{name: string, description: string, imageUrl: string, price: string, buttonText: string, buttonUrl: string}>,
  promoCode?: string,
  expiryDate?: string
): string => {
  const baseTemplate = getBaseTemplate(options);
  
  let productsHtml = '';
  if (products && Array.isArray(products)) {
    products.forEach(product => {
      productsHtml += `
        <div style="margin-bottom: 30px;">
          <img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100%; height: auto; margin-bottom: 16px;">
          <h2 style="color: ${options.brandColors?.primary || '#0d233f'};">${product.name}</h2>
          <p>${product.description}</p>
          <p style="font-weight: bold; font-size: 18px; color: ${options.brandColors?.secondary || '#7f2628'};">${product.price}</p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
            <tbody>
              <tr>
                <td align="left">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tbody>
                      <tr>
                        <td> <a href="${product.buttonUrl}" target="_blank">${product.buttonText}</a> </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    });
  } else {
    // Default product if none provided
    productsHtml = `
      <div style="margin-bottom: 30px;">
        <h2 style="color: ${options.brandColors?.primary || '#0d233f'};">Featured Product</h2>
        <p>Check out our latest offerings and special deals.</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
          <tbody>
            <tr>
              <td align="left">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr>
                      <td> <a href="#" target="_blank">Shop Now</a> </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
  
  let promoSection = '';
  if (promoCode) {
    promoSection = `
      <div style="background-color: #f4f5f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h2 style="color: ${options.brandColors?.primary || '#0d233f'};">Special Offer</h2>
        <p>Use promo code:</p>
        <p style="font-size: 24px; font-weight: bold; color: ${options.brandColors?.secondary || '#7f2628'};">${promoCode}</p>
        ${expiryDate ? `<p>Offer valid until ${expiryDate}</p>` : ''}
      </div>
    `;
  }
  
  const emailContent = `
    <h1>${title}</h1>
    ${intro}
    ${promoSection}
    ${productsHtml}
  `;
  
  return baseTemplate
    .replace('{{preheader}}', title)
    .replace('{{content}}', emailContent)
    .replace('{{unsubscribe_url}}', '#');
};

/**
 * Welcome email template for new customers
 */
export const getWelcomeTemplate = (
  options: EmailGenerationOptions,
  userName: string,
  welcomeMessage: string,
  nextSteps: Array<{title: string, description: string, iconUrl?: string}>,
  buttonText: string,
  buttonUrl: string
): string => {
  const baseTemplate = getBaseTemplate(options);
  
  let stepsHtml = '';
  if (nextSteps && Array.isArray(nextSteps)) {
    nextSteps.forEach((step, index) => {
      stepsHtml += `
        <div style="margin-bottom: 20px; display: flex; align-items: flex-start;">
          <div style="background-color: ${options.brandColors?.primary || '#0d233f'}; color: white; border-radius: 50%; width: 30px; height: 30px; text-align: center; line-height: 30px; margin-right: 15px; flex-shrink: 0;">
            ${index + 1}
          </div>
          <div>
            <h3 style="margin-top: 0; color: ${options.brandColors?.primary || '#0d233f'};">${step.title}</h3>
            <p>${step.description}</p>
          </div>
        </div>
      `;
    });
  } else {
    // Default steps if none provided
    stepsHtml = `
      <div style="margin-bottom: 20px; display: flex; align-items: flex-start;">
        <div style="background-color: ${options.brandColors?.primary || '#0d233f'}; color: white; border-radius: 50%; width: 30px; height: 30px; text-align: center; line-height: 30px; margin-right: 15px; flex-shrink: 0;">
          1
        </div>
        <div>
          <h3 style="margin-top: 0; color: ${options.brandColors?.primary || '#0d233f'};">Explore Your Dashboard</h3>
          <p>Get familiar with your new account and discover all the features available to you.</p>
        </div>
      </div>
      <div style="margin-bottom: 20px; display: flex; align-items: flex-start;">
        <div style="background-color: ${options.brandColors?.primary || '#0d233f'}; color: white; border-radius: 50%; width: 30px; height: 30px; text-align: center; line-height: 30px; margin-right: 15px; flex-shrink: 0;">
          2
        </div>
        <div>
          <h3 style="margin-top: 0; color: ${options.brandColors?.primary || '#0d233f'};">Complete Your Profile</h3>
          <p>Update your profile information to get the most out of your experience.</p>
        </div>
      </div>
    `;
  }
  
  const emailContent = `
    <h1>Welcome, ${userName}!</h1>
    <p>${welcomeMessage}</p>
    
    <h2 style="color: ${options.brandColors?.primary || '#0d233f'};">Here's how to get started:</h2>
    ${stepsHtml}
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
      <tbody>
        <tr>
          <td align="left">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td> <a href="${buttonUrl}" target="_blank">${buttonText}</a> </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `;
  
  return baseTemplate
    .replace('{{preheader}}', `Welcome to ${options.clientName}`)
    .replace('{{content}}', emailContent)
    .replace('{{unsubscribe_url}}', '#');
};

/**
 * Announcement email template
 */
export const getAnnouncementTemplate = (
  options: EmailGenerationOptions,
  title: string,
  announcement: string,
  details: string,
  imageUrl?: string,
  buttonText?: string,
  buttonUrl?: string
): string => {
  const baseTemplate = getBaseTemplate(options);
  
  let buttonHtml = '';
  if (buttonText && buttonUrl) {
    buttonHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
        <tbody>
          <tr>
            <td align="left">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr>
                    <td> <a href="${buttonUrl}" target="_blank">${buttonText}</a> </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }
  
  const emailContent = `
    <h1>${title}</h1>
    <p style="font-size: 18px; font-weight: bold;">${announcement}</p>
    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="max-width: 100%; height: auto; margin: 20px 0;">` : ''}
    ${details}
    ${buttonHtml}
  `;
  
  return baseTemplate
    .replace('{{preheader}}', title)
    .replace('{{content}}', emailContent)
    .replace('{{unsubscribe_url}}', '#');
};

/**
 * Personal touch email template
 */
export const getPersonalTouchTemplate = (
  options: EmailGenerationOptions,
  greeting: string,
  message: string,
  signature: string
): string => {
  const baseTemplate = getBaseTemplate(options);
  
  const emailContent = `
    <p style="font-size: 18px;">${greeting},</p>
    <p>${message}</p>
    <p>Best regards,<br>${signature}<br>${options.clientName}</p>
  `;
  
  return baseTemplate
    .replace('{{preheader}}', `A quick message from ${options.clientName}`)
    .replace('{{content}}', emailContent)
    .replace('{{unsubscribe_url}}', '#');
};

/**
 * Get the appropriate template based on the email purpose
 */
export const getTemplateByType = (
  options: EmailGenerationOptions,
  type: EmailTemplateType,
  templateData: any = {}
): string => {
  // Set default values for templateData if not provided
  const data = {
    title: templateData.title || 'Email from ' + options.clientName,
    content: templateData.content || '<p>No content provided.</p>',
    buttonText: templateData.buttonText || 'Learn More',
    buttonUrl: templateData.buttonUrl || '#',
    intro: templateData.intro || '<p>Here are our latest updates:</p>',
    sections: templateData.sections || [],
    products: templateData.products || [],
    promoCode: templateData.promoCode || '',
    expiryDate: templateData.expiryDate || '',
    userName: templateData.userName || 'Valued Customer',
    welcomeMessage: templateData.welcomeMessage || '<p>Thank you for joining us! We are excited to have you on board.</p>',
    nextSteps: templateData.nextSteps || [],
    announcement: templateData.announcement || 'We have an important announcement to share with you.',
    details: templateData.details || '<p>More details will be provided soon.</p>',
    imageUrl: templateData.imageUrl || '',
    greeting: templateData.greeting || 'Hello',
    message: templateData.message || '<p>Just wanted to check in and see how you are doing.</p>',
    signature: templateData.signature || 'Your friends at ' + options.clientName
  };
  
  switch (type) {
    case 'simple':
      return getSimpleTemplate(
        options,
        data.title,
        data.content,
        data.buttonText,
        data.buttonUrl
      );
    case 'newsletter':
      return getNewsletterTemplate(
        options,
        data.title,
        data.intro,
        data.sections,
        data.buttonText,
        data.buttonUrl
      );
    case 'promotional':
      return getPromotionalTemplate(
        options,
        data.title,
        data.intro,
        data.products,
        data.promoCode,
        data.expiryDate
      );
    case 'welcome':
      return getWelcomeTemplate(
        options,
        data.userName,
        data.welcomeMessage,
        data.nextSteps,
        data.buttonText,
        data.buttonUrl
      );
    case 'announcement':
      return getAnnouncementTemplate(
        options,
        data.title,
        data.announcement,
        data.details,
        data.imageUrl,
        data.buttonText,
        data.buttonUrl
      );
    case 'personal-touch':
      return getPersonalTouchTemplate(
        options,
        data.greeting,
        data.message,
        data.signature
      );
    default:
      // Default to simple template if type is not recognized
      return getSimpleTemplate(
        options,
        data.title,
        data.content,
        data.buttonText,
        data.buttonUrl
      );
  }
};
