/**
 * Email Template Generator
 * Generate responsive HTML email templates
 */

interface EmailData {
  subject: string;
  preheader?: string;
  content: string;
  ctaText?: string;
  ctaLink?: string;
}

export function generateEmailTemplate(data: EmailData): string {
  const { subject, preheader, content, ctaText, ctaLink } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 20px; color: #333333; }
    .content p { line-height: 1.6; margin: 16px 0; }
    .cta { text-align: center; padding: 30px 20px; }
    .cta-button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: bold; }
    .footer { background-color: #f5f5f5; padding: 30px 20px; text-align: center; color: #666666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .header h1 { font-size: 24px; }
      .content { padding: 30px 15px; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>BioinformaticsHub</h1>
              <p style="color: #ffffff; margin-top: 10px; opacity: 0.9;">Your Hub for Bioinformatics Excellence</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>
          
          ${ctaText && ctaLink ? `
          <tr>
            <td class="cta">
              <a href="${ctaLink}" class="cta-button">${ctaText}</a>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p><strong>BioinformaticsHub</strong></p>
              <p>Your comprehensive resource for bioinformatics tools, courses, and community.</p>
              <p>
                <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit Website</a>
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #999999;">
                &copy; ${new Date().getFullYear()} BioinformaticsHub. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Newsletter templates
export const emailTemplates = {
  welcome: (name: string) => generateEmailTemplate({
    subject: "Welcome to BioinformaticsHub! 🧬",
    preheader: "Start your journey in bioinformatics",
    content: `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for joining BioinformaticsHub! We're excited to have you as part of our community.</p>
      <p>Here's what you can expect:</p>
      <ul>
        <li>📚 Weekly curated bioinformatics tools and resources</li>
        <li>🎓 Latest courses and tutorials</li>
        <li>📰 Industry news and research highlights</li>
        <li>💡 Expert tips and best practices</li>
      </ul>
      <p>Ready to explore? Visit our directory to discover amazing tools!</p>
    `,
    ctaText: "Explore Tools",
    ctaLink: `${process.env.NEXT_PUBLIC_BASE_URL}/directory`,
  }),

  weeklyDigest: (tools: string[], posts: string[]) => generateEmailTemplate({
    subject: "Your Weekly BioinformaticsHub Digest 📊",
    preheader: "New tools, courses, and articles this week",
    content: `
      <h2>This Week's Highlights</h2>
      
      ${tools.length > 0 ? `
      <h3>🛠️ New Tools Added</h3>
      <ul>
        ${tools.map(tool => `<li>${tool}</li>`).join('\n')}
      </ul>
      ` : ''}
      
      ${posts.length > 0 ? `
      <h3>📝 Latest Articles</h3>
      <ul>
        ${posts.map(post => `<li>${post}</li>`).join('\n')}
      </ul>
      ` : ''}
      
      <p>Stay ahead in your bioinformatics journey!</p>
    `,
    ctaText: "Read More",
    ctaLink: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
  }),

  newToolAlert: (toolName: string, toolDescription: string, toolUrl: string) => generateEmailTemplate({
    subject: `New Tool Alert: ${toolName} 🚀`,
    preheader: toolDescription,
    content: `
      <h2>Exciting New Tool!</h2>
      <h3>${toolName}</h3>
      <p>${toolDescription}</p>
      <p>Check it out and see how it can enhance your workflow!</p>
    `,
    ctaText: "View Tool",
    ctaLink: toolUrl,
  }),

  passwordReset: (resetLink: string) => generateEmailTemplate({
    subject: "Reset Your Password - BioinformaticsHub",
    preheader: "Reset your account password",
    content: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
    `,
    ctaText: "Reset Password",
    ctaLink: resetLink,
  }),
};

// Plain text version generator
export function generatePlainTextEmail(data: EmailData): string {
  const { subject, content, ctaText, ctaLink } = data;
  
  return `
${subject}

${content.replace(/<[^>]*>/g, '')}

${ctaText && ctaLink ? `${ctaText}: ${ctaLink}` : ''}

---
BioinformaticsHub
Your comprehensive resource for bioinformatics tools, courses, and community.

Unsubscribe: {{unsubscribe_url}}
Visit Website: ${process.env.NEXT_PUBLIC_BASE_URL}

© ${new Date().getFullYear()} BioinformaticsHub. All rights reserved.
  `.trim();
}
