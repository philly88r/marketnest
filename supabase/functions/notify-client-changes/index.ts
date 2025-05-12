// supabase/functions/notify-client-changes/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

// Email configuration
const SMTP_HOST = 'smtp.titan.email' // Titan email SMTP server
const SMTP_PORT = 465
const SMTP_USERNAME = 'info@marketnest.org' // Titan email address
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || 'Yitbos88$' // Password (ideally set via Supabase secrets)
const FROM_EMAIL = 'info@marketnest.org'
const ADMIN_EMAIL = 'info@marketnest.org' // Admin email for CC on all notifications

// Helper function to send email
async function sendEmail(to: string, subject: string, htmlBody: string) {
  const client = new SmtpClient()
  
  await client.connectTLS({
    hostname: SMTP_HOST,
    port: SMTP_PORT,
    username: SMTP_USERNAME,
    password: SMTP_PASSWORD,
  })

  await client.send({
    from: FROM_EMAIL,
    to: to,
    cc: ADMIN_EMAIL, // CC admin on all notifications
    subject: subject,
    content: "This email requires HTML to view",
    html: htmlBody,
  })

  await client.close()
}

// Generate email content based on action type
function generateEmailContent(payload: any) {
  const { client_name, action_type, change_description, task_name, admin_user, timestamp } = payload
  const date = new Date(timestamp).toLocaleDateString()
  const time = new Date(timestamp).toLocaleTimeString()
  
  // Email header with logo and styling
  const emailHeader = `
    <div style="background-color: #f8f9fa; padding: 20px; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #0d233f 0%, #1a365d 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MarketNest</h1>
          <p style="color: #d4a24e; margin: 5px 0 0 0;">Digital Marketing Agency</p>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #0d233f; border-bottom: 2px solid #d4a24e; padding-bottom: 10px;">Update Notification</h2>
          <p>Hello ${client_name},</p>
  `

  // Email content based on action type
  let emailContent = ''
  
  switch (action_type) {
    case 'task_completion':
      emailContent = `
        <p>We're pleased to inform you that a task in your checklist has been completed:</p>
        <div style="background-color: #f0f7ff; border-left: 4px solid #0d233f; padding: 15px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Task:</strong> ${task_name}</p>
          <p style="margin: 5px 0 0 0;"><strong>Completed by:</strong> ${admin_user}</p>
          <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${date} at ${time}</p>
        </div>
        <p>You can view more details in your client dashboard.</p>
      `
      break
      
    case 'project_update':
      emailContent = `
        <p>We've made an update to one of your projects:</p>
        <div style="background-color: #f0f7ff; border-left: 4px solid #0d233f; padding: 15px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Update:</strong> ${change_description}</p>
          <p style="margin: 5px 0 0 0;"><strong>Updated by:</strong> ${admin_user}</p>
          <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${date} at ${time}</p>
        </div>
        <p>Please log in to your client dashboard to see the changes.</p>
      `
      break
      
    case 'task_update':
      emailContent = `
        <p>We've made an update to one of your tasks:</p>
        <div style="background-color: #f0f7ff; border-left: 4px solid #0d233f; padding: 15px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Update:</strong> ${change_description}</p>
          <p style="margin: 5px 0 0 0;"><strong>Updated by:</strong> ${admin_user}</p>
          <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${date} at ${time}</p>
        </div>
        <p>Please log in to your client dashboard to see the changes.</p>
      `
      break
      
    case 'checklist_update':
      emailContent = `
        <p>We've made an update to your checklist:</p>
        <div style="background-color: #f0f7ff; border-left: 4px solid #0d233f; padding: 15px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Update:</strong> ${change_description}</p>
          <p style="margin: 5px 0 0 0;"><strong>Updated by:</strong> ${admin_user}</p>
          <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${date} at ${time}</p>
        </div>
        <p>Please log in to your client dashboard to see the changes.</p>
      `
      break
      
    case 'file_update':
      emailContent = `
        <p>We've made an update to your files:</p>
        <div style="background-color: #f0f7ff; border-left: 4px solid #0d233f; padding: 15px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Update:</strong> ${change_description}</p>
          <p style="margin: 5px 0 0 0;"><strong>Updated by:</strong> ${admin_user}</p>
          <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${date} at ${time}</p>
        </div>
        <p>Please log in to your client dashboard to see the changes.</p>
      `
      break
      
    default:
      emailContent = `
        <p>We've made an update to your account:</p>
        <div style="background-color: #f0f7ff; border-left: 4px solid #0d233f; padding: 15px; margin: 15px 0;">
          <p style="margin: 0;"><strong>Update:</strong> ${change_description}</p>
          <p style="margin: 5px 0 0 0;"><strong>Updated by:</strong> ${admin_user}</p>
          <p style="margin: 5px 0 0 0;"><strong>Date:</strong> ${date} at ${time}</p>
        </div>
        <p>Please log in to your client dashboard to see the changes.</p>
      `
  }
  
  // Email footer
  const emailFooter = `
          <p>Thank you for choosing MarketNest for your digital marketing needs.</p>
          <p>Best regards,<br>The MarketNest Team</p>
        </div>
        <div style="background-color: #0d233f; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} MarketNest Digital Marketing Agency. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">
            <a href="https://marketnest.com/privacy" style="color: #d4a24e; text-decoration: none;">Privacy Policy</a> | 
            <a href="https://marketnest.com/terms" style="color: #d4a24e; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  `
  
  return emailHeader + emailContent + emailFooter
}

// Generate subject line based on action type
function generateSubject(payload: any) {
  const { client_name, action_type, change_description } = payload
  
  switch (action_type) {
    case 'task_completion':
      return `[MarketNest] Task Completed: ${payload.task_name}`
    case 'project_update':
      return `[MarketNest] Project Update for ${client_name}`
    case 'task_update':
      return `[MarketNest] Task Update for ${client_name}`
    case 'checklist_update':
      return `[MarketNest] Checklist Update for ${client_name}`
    case 'file_update':
      return `[MarketNest] File Update for ${client_name}`
    default:
      return `[MarketNest] Account Update for ${client_name}`
  }
}

// Main handler function
serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Parse the request body
    const payload = await req.json()
    
    // Validate required fields
    if (!payload.client_email || !payload.client_name) {
      console.error('Missing required fields:', payload)
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Generate email content and subject
    const htmlContent = generateEmailContent(payload)
    const subject = generateSubject(payload)
    
    // Send the email
    await sendEmail(payload.client_email, subject, htmlContent)
    
    // Log success
    console.log(`Email sent to ${payload.client_email} for ${payload.action_type}`)
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // Log and return error
    console.error('Error sending notification email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
