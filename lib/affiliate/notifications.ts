/**
 * Affiliate Email Notification Service (Extended)
 * 
 * Handles email notifications for affiliate events:
 * - New conversion alerts
 * - Payout confirmations  
 * - Partner status updates
 * - Link health warnings
 * - Campaign events
 * - Fraud alerts
 * - Partner notifications
 * - Milestone celebrations
 */

import { prisma } from '@/lib/prisma';

// Email configuration types
export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Common email styles
const emailStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f1f5f9; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
  .header { padding: 30px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .content { padding: 30px; }
  .stat { display: inline-block; text-align: center; padding: 15px; margin: 10px; background: #f8fafc; border-radius: 8px; }
  .stat-value { font-size: 28px; font-weight: bold; color: #10b981; }
  .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
  .details { margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; }
  .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
  .details-row:last-child { border-bottom: none; }
  .btn { display: inline-block; padding: 12px 24px; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
  .alert { padding: 15px; border-radius: 8px; margin-bottom: 20px; }
  .alert-warning { background: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e; }
  .alert-danger { background: #fee2e2; border-left: 4px solid #ef4444; color: #991b1b; }
  .alert-success { background: #d1fae5; border-left: 4px solid #10b981; color: #065f46; }
`;

// Email templates
export const emailTemplates = {
  /**
   * New conversion notification for admin
   */
  newConversion: (data: {
    partnerName: string;
    productName?: string;
    saleAmount: number;
    commissionAmount: number;
    orderId?: string;
    conversionType: string;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `💰 New ${data.conversionType} Conversion: $${data.saleAmount.toFixed(2)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #10b981, #06b6d4);">
              <h1>🎉 New Conversion!</h1>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <div class="stat">
                  <div class="stat-value">$${data.saleAmount.toFixed(2)}</div>
                  <div class="stat-label">Sale Amount</div>
                </div>
                <div class="stat">
                  <div class="stat-value">$${data.commissionAmount.toFixed(2)}</div>
                  <div class="stat-label">Commission</div>
                </div>
              </div>
              <div class="details">
                <div class="details-row">
                  <span><strong>Partner:</strong></span>
                  <span>${data.partnerName}</span>
                </div>
                ${data.productName ? `
                <div class="details-row">
                  <span><strong>Product:</strong></span>
                  <span>${data.productName}</span>
                </div>` : ''}
                <div class="details-row">
                  <span><strong>Type:</strong></span>
                  <span>${data.conversionType}</span>
                </div>
                ${data.orderId ? `
                <div class="details-row">
                  <span><strong>Order ID:</strong></span>
                  <span>${data.orderId}</span>
                </div>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate/conversions" class="btn" style="background: #10b981;">
                  Review Conversion
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `New ${data.conversionType} conversion from ${data.partnerName}. Sale: $${data.saleAmount.toFixed(2)}, Commission: $${data.commissionAmount.toFixed(2)}`,
  }),

  /**
   * High-value conversion notification
   */
  highValueConversion: (data: {
    partnerName: string;
    productName?: string;
    saleAmount: number;
    commissionAmount: number;
    threshold: number;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `🚀 HIGH VALUE Conversion: $${data.saleAmount.toFixed(2)} from ${data.partnerName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">
              <h1>🚀 High-Value Conversion!</h1>
            </div>
            <div class="content">
              <div class="alert alert-success">
                <strong>Congratulations!</strong> This conversion exceeds your threshold of $${data.threshold.toFixed(2)}.
              </div>
              <div style="text-align: center;">
                <div class="stat">
                  <div class="stat-value" style="color: #f59e0b;">$${data.saleAmount.toFixed(2)}</div>
                  <div class="stat-label">Sale Amount</div>
                </div>
                <div class="stat">
                  <div class="stat-value" style="color: #10b981;">$${data.commissionAmount.toFixed(2)}</div>
                  <div class="stat-label">Commission</div>
                </div>
              </div>
              <div class="details">
                <div class="details-row">
                  <span><strong>Partner:</strong></span>
                  <span>${data.partnerName}</span>
                </div>
                ${data.productName ? `
                <div class="details-row">
                  <span><strong>Product:</strong></span>
                  <span>${data.productName}</span>
                </div>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate/conversions" class="btn" style="background: #f59e0b;">
                  View Details
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `High-value conversion of $${data.saleAmount.toFixed(2)} from ${data.partnerName}!`,
  }),

  /**
   * Payout confirmation for admin
   */
  payoutCreated: (data: {
    partnerName: string;
    payoutAmount: number;
    conversionCount: number;
    periodStart: string;
    periodEnd: string;
    payoutId: string;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `📤 Payout Created: $${data.payoutAmount.toFixed(2)} for ${data.partnerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
              <h1>📤 Payout Created</h1>
            </div>
            <div class="content">
              <div style="text-align: center; font-size: 48px; font-weight: bold; color: #6366f1; margin: 20px 0;">
                $${data.payoutAmount.toFixed(2)}
              </div>
              <div class="details">
                <div class="details-row">
                  <span><strong>Partner:</strong></span>
                  <span>${data.partnerName}</span>
                </div>
                <div class="details-row">
                  <span><strong>Conversions:</strong></span>
                  <span>${data.conversionCount}</span>
                </div>
                <div class="details-row">
                  <span><strong>Period:</strong></span>
                  <span>${data.periodStart} - ${data.periodEnd}</span>
                </div>
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate/payouts" class="btn" style="background: #6366f1;">
                  Process Payout
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Payout created for ${data.partnerName}: $${data.payoutAmount.toFixed(2)} for ${data.conversionCount} conversions.`,
  }),

  /**
   * Payout completed - notification to partner
   */
  payoutCompleted: (data: {
    partnerEmail: string;
    partnerName: string;
    payoutAmount: number;
    conversionCount: number;
    transactionId?: string;
    paymentMethod: string;
  }): EmailConfig => ({
    to: data.partnerEmail,
    subject: `💸 Your Payout of $${data.payoutAmount.toFixed(2)} Has Been Processed`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #10b981, #059669);">
              <h1>💸 Payout Processed!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.partnerName},</p>
              <p>Great news! Your affiliate payout has been processed and is on its way.</p>
              <div style="text-align: center; font-size: 48px; font-weight: bold; color: #10b981; margin: 30px 0;">
                $${data.payoutAmount.toFixed(2)}
              </div>
              <div class="details">
                <div class="details-row">
                  <span><strong>Conversions Paid:</strong></span>
                  <span>${data.conversionCount}</span>
                </div>
                <div class="details-row">
                  <span><strong>Payment Method:</strong></span>
                  <span>${data.paymentMethod}</span>
                </div>
                ${data.transactionId ? `
                <div class="details-row">
                  <span><strong>Transaction ID:</strong></span>
                  <span>${data.transactionId}</span>
                </div>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/partner" class="btn" style="background: #10b981;">
                  View Your Dashboard
                </a>
              </div>
              <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                Thank you for being a valued BioinformaticsHub affiliate partner!
              </p>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate Program</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your payout of $${data.payoutAmount.toFixed(2)} has been processed via ${data.paymentMethod}.`,
  }),

  /**
   * Link health warning
   */
  linkHealthWarning: (data: {
    unhealthyLinks: Array<{ shortCode: string; url: string; status: number }>;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `⚠️ Affiliate Link Health Alert: ${data.unhealthyLinks.length} broken links`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">
              <h1>⚠️ Link Health Alert</h1>
            </div>
            <div class="content">
              <div class="alert alert-warning">
                <strong>Attention:</strong> ${data.unhealthyLinks.length} affiliate links are returning errors.
              </div>
              ${data.unhealthyLinks.map(link => `
              <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ef4444;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-family: monospace; color: #6366f1; font-weight: 600;">/go/${link.shortCode}</span>
                  <span style="padding: 4px 8px; background: #fef2f2; color: #ef4444; border-radius: 4px; font-size: 12px; font-weight: 600;">HTTP ${link.status || 'Error'}</span>
                </div>
                <div style="font-size: 12px; color: #64748b; word-break: break-all;">${link.url}</div>
              </div>
              `).join('')}
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate/links" class="btn" style="background: #f59e0b;">
                  Review Links
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `${data.unhealthyLinks.length} affiliate links are returning errors. Please review.`,
  }),

  /**
   * Fraud alert
   */
  fraudAlert: (data: {
    alertType: 'click_fraud' | 'conversion_fraud' | 'suspicious_activity';
    partnerId: string;
    partnerName: string;
    details: string;
    fraudScore: number;
    ipAddress?: string;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `🚨 Fraud Alert: ${data.alertType.replace('_', ' ')} detected`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #ef4444, #991b1b);">
              <h1>🚨 Fraud Alert</h1>
            </div>
            <div class="content">
              <div class="alert alert-danger">
                <strong>Potential ${data.alertType.replace('_', ' ')} detected!</strong>
                <p style="margin: 10px 0 0 0;">${data.details}</p>
              </div>
              <div class="details">
                <div class="details-row">
                  <span><strong>Partner:</strong></span>
                  <span>${data.partnerName}</span>
                </div>
                <div class="details-row">
                  <span><strong>Fraud Score:</strong></span>
                  <span style="color: ${data.fraudScore > 70 ? '#ef4444' : '#f59e0b'}; font-weight: bold;">${data.fraudScore}/100</span>
                </div>
                ${data.ipAddress ? `
                <div class="details-row">
                  <span><strong>IP Address:</strong></span>
                  <span>${data.ipAddress}</span>
                </div>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate/conversions" class="btn" style="background: #ef4444;">
                  Investigate
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Fraud alert: ${data.alertType} detected for ${data.partnerName}. Score: ${data.fraudScore}/100`,
  }),

  /**
   * Campaign started notification
   */
  campaignStarted: (data: {
    campaignName: string;
    partnerName?: string;
    startDate: string;
    endDate?: string;
    discountCode?: string;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `🚀 Campaign Started: ${data.campaignName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
              <h1>🚀 Campaign Started!</h1>
            </div>
            <div class="content">
              <h2 style="text-align: center; color: #1e293b; margin: 20px 0;">${data.campaignName}</h2>
              <div class="details">
                ${data.partnerName ? `
                <div class="details-row">
                  <span><strong>Partner:</strong></span>
                  <span>${data.partnerName}</span>
                </div>` : ''}
                <div class="details-row">
                  <span><strong>Started:</strong></span>
                  <span>${data.startDate}</span>
                </div>
                ${data.endDate ? `
                <div class="details-row">
                  <span><strong>Ends:</strong></span>
                  <span>${data.endDate}</span>
                </div>` : ''}
                ${data.discountCode ? `
                <div class="details-row">
                  <span><strong>Discount Code:</strong></span>
                  <span style="font-family: monospace; font-weight: bold;">${data.discountCode}</span>
                </div>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate/campaigns" class="btn" style="background: #3b82f6;">
                  View Campaign
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Campaign "${data.campaignName}" has started.`,
  }),

  /**
   * Campaign ending soon notification
   */
  campaignEndingSoon: (data: {
    campaignName: string;
    endDate: string;
    daysRemaining: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `⏰ Campaign "${data.campaignName}" ends in ${data.daysRemaining} days`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #f59e0b, #f97316);">
              <h1>⏰ Campaign Ending Soon</h1>
            </div>
            <div class="content">
              <div class="alert alert-warning">
                <strong>Heads up!</strong> "${data.campaignName}" ends on ${data.endDate} (${data.daysRemaining} days remaining).
              </div>
              <h3 style="text-align: center; margin: 20px 0;">Performance So Far</h3>
              <div style="text-align: center;">
                <div class="stat">
                  <div class="stat-value" style="color: #3b82f6;">${data.totalClicks.toLocaleString()}</div>
                  <div class="stat-label">Clicks</div>
                </div>
                <div class="stat">
                  <div class="stat-value" style="color: #10b981;">${data.totalConversions}</div>
                  <div class="stat-label">Conversions</div>
                </div>
                <div class="stat">
                  <div class="stat-value" style="color: #6366f1;">$${data.totalRevenue.toFixed(0)}</div>
                  <div class="stat-label">Revenue</div>
                </div>
              </div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate/campaigns" class="btn" style="background: #f59e0b;">
                  View Campaign
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Campaign "${data.campaignName}" ends in ${data.daysRemaining} days. Performance: ${data.totalClicks} clicks, ${data.totalConversions} conversions, $${data.totalRevenue.toFixed(0)} revenue.`,
  }),

  /**
   * Milestone achievement
   */
  milestoneAchieved: (data: {
    milestoneType: 'revenue' | 'conversions' | 'clicks';
    milestoneValue: number;
    partnerName?: string;
    period: string;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `🏆 Milestone Achieved: ${data.milestoneType === 'revenue' ? '$' : ''}${data.milestoneValue.toLocaleString()} ${data.milestoneType}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #f59e0b, #fbbf24);">
              <h1>🏆 Milestone Achieved!</h1>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <div style="font-size: 72px; margin: 20px 0;">🎉</div>
                <h2 style="color: #1e293b; margin: 0;">
                  ${data.milestoneType === 'revenue' ? '$' : ''}${data.milestoneValue.toLocaleString()} ${data.milestoneType}
                </h2>
                <p style="color: #64748b; margin-top: 10px;">
                  ${data.partnerName ? `${data.partnerName} reached this milestone ` : 'You reached this milestone '}
                  in ${data.period}
                </p>
              </div>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate" class="btn" style="background: #f59e0b;">
                  View Dashboard
                </a>
              </div>
            </div>
            <div class="footer">
              Keep up the great work! 🚀<br>
              BioinformaticsHub.io Affiliate System
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Milestone achieved! ${data.milestoneType === 'revenue' ? '$' : ''}${data.milestoneValue.toLocaleString()} ${data.milestoneType} in ${data.period}.`,
  }),

  /**
   * Weekly performance summary
   */
  weeklyReport: (data: {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    totalCommission: number;
    topPartners: Array<{ name: string; conversions: number; revenue: number }>;
    periodStart: string;
    periodEnd: string;
    weekOverWeekChange?: { clicks: number; conversions: number; revenue: number };
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `📊 Weekly Affiliate Report: $${data.totalRevenue.toFixed(0)} Revenue`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #10b981, #3b82f6);">
              <h1>📊 Weekly Affiliate Report</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">${data.periodStart} - ${data.periodEnd}</p>
            </div>
            <div class="content">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div class="stat" style="display: block;">
                  <div class="stat-value">${data.totalClicks.toLocaleString()}</div>
                  <div class="stat-label">Total Clicks</div>
                  ${data.weekOverWeekChange ? `<small style="color: ${data.weekOverWeekChange.clicks >= 0 ? '#10b981' : '#ef4444'};">${data.weekOverWeekChange.clicks >= 0 ? '↑' : '↓'} ${Math.abs(data.weekOverWeekChange.clicks)}%</small>` : ''}
                </div>
                <div class="stat" style="display: block;">
                  <div class="stat-value">${data.totalConversions}</div>
                  <div class="stat-label">Conversions</div>
                  ${data.weekOverWeekChange ? `<small style="color: ${data.weekOverWeekChange.conversions >= 0 ? '#10b981' : '#ef4444'};">${data.weekOverWeekChange.conversions >= 0 ? '↑' : '↓'} ${Math.abs(data.weekOverWeekChange.conversions)}%</small>` : ''}
                </div>
                <div class="stat" style="display: block;">
                  <div class="stat-value">$${data.totalRevenue.toFixed(0)}</div>
                  <div class="stat-label">Revenue</div>
                  ${data.weekOverWeekChange ? `<small style="color: ${data.weekOverWeekChange.revenue >= 0 ? '#10b981' : '#ef4444'};">${data.weekOverWeekChange.revenue >= 0 ? '↑' : '↓'} ${Math.abs(data.weekOverWeekChange.revenue)}%</small>` : ''}
                </div>
                <div class="stat" style="display: block;">
                  <div class="stat-value">$${data.totalCommission.toFixed(0)}</div>
                  <div class="stat-label">Commission</div>
                </div>
              </div>
              
              <h3 style="margin-bottom: 10px;">Top Partners</h3>
              <div style="background: #f8fafc; border-radius: 8px; overflow: hidden;">
                ${data.topPartners.map(partner => `
                <div style="display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">
                  <span><strong>${partner.name}</strong></span>
                  <span>${partner.conversions} sales · $${partner.revenue.toFixed(0)}</span>
                </div>
                `).join('')}
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate" class="btn" style="background: #3b82f6;">
                  View Full Dashboard
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Weekly Report: ${data.totalClicks} clicks, ${data.totalConversions} conversions, $${data.totalRevenue.toFixed(0)} revenue.`,
  }),

  /**
   * New partner welcome email
   */
  partnerWelcome: (data: {
    partnerEmail: string;
    partnerName: string;
    partnerId: string;
    apiKey: string;
    commissionRate: number;
    commissionType: string;
  }): EmailConfig => ({
    to: data.partnerEmail,
    subject: `🎉 Welcome to BioinformaticsHub Affiliate Program!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #10b981, #06b6d4);">
              <h1>🎉 Welcome to BioinformaticsHub!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.partnerName},</p>
              <p>Welcome to the BioinformaticsHub Affiliate Program! We're excited to have you as a partner.</p>
              
              <div class="alert alert-success">
                <strong>Your account is now active!</strong>
              </div>
              
              <h3>Your Credentials</h3>
              <div class="details">
                <div class="details-row">
                  <span><strong>Partner ID:</strong></span>
                  <span style="font-family: monospace;">${data.partnerId}</span>
                </div>
                <div class="details-row">
                  <span><strong>API Key:</strong></span>
                  <span style="font-family: monospace;">${data.apiKey}</span>
                </div>
                <div class="details-row">
                  <span><strong>Commission Rate:</strong></span>
                  <span>${data.commissionRate}% ${data.commissionType}</span>
                </div>
              </div>
              
              <div class="alert alert-warning">
                <strong>Keep your API Key secure!</strong> Do not share it publicly.
              </div>
              
              <h3>Getting Started</h3>
              <ol style="color: #475569; line-height: 1.8;">
                <li>Log in to your Partner Dashboard</li>
                <li>Browse available products</li>
                <li>Generate affiliate links</li>
                <li>Start promoting and earning!</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/partner/login" class="btn" style="background: #10b981;">
                  Access Partner Dashboard
                </a>
              </div>
              
              <p style="margin-top: 30px; color: #64748b;">
                Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/affiliate/disclosure">affiliate policy page</a>.
              </p>
            </div>
            <div class="footer">
              BioinformaticsHub.io Affiliate Program<br>
              Connecting researchers with the best tools in bioinformatics
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to BioinformaticsHub! Partner ID: ${data.partnerId}, Commission: ${data.commissionRate}% ${data.commissionType}`,
  }),

  /**
   * Daily digest for admin
   */
  dailyDigest: (data: {
    date: string;
    clicks: number;
    conversions: number;
    revenue: number;
    pendingApprovals: number;
    newPartners: number;
    alerts: Array<{ type: string; message: string }>;
  }): EmailConfig => ({
    to: process.env.ADMIN_EMAIL || 'admin@bioinformaticshub.io',
    subject: `📋 Daily Affiliate Digest: ${data.date}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${emailStyles}</style></head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header" style="background: linear-gradient(135deg, #64748b, #475569);">
              <h1>📋 Daily Digest</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">${data.date}</p>
            </div>
            <div class="content">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div class="stat" style="display: block;">
                  <div class="stat-value" style="font-size: 24px;">${data.clicks.toLocaleString()}</div>
                  <div class="stat-label">Clicks</div>
                </div>
                <div class="stat" style="display: block;">
                  <div class="stat-value" style="font-size: 24px;">${data.conversions}</div>
                  <div class="stat-label">Conversions</div>
                </div>
                <div class="stat" style="display: block;">
                  <div class="stat-value" style="font-size: 24px;">$${data.revenue.toFixed(0)}</div>
                  <div class="stat-label">Revenue</div>
                </div>
              </div>
              
              ${data.pendingApprovals > 0 ? `
              <div class="alert alert-warning">
                <strong>${data.pendingApprovals}</strong> conversions pending approval
              </div>` : ''}
              
              ${data.newPartners > 0 ? `
              <div class="alert alert-success">
                <strong>${data.newPartners}</strong> new partner(s) registered
              </div>` : ''}
              
              ${data.alerts.length > 0 ? `
              <h3>Alerts</h3>
              ${data.alerts.map(alert => `
              <div class="alert alert-${alert.type === 'warning' ? 'warning' : 'danger'}">
                ${alert.message}
              </div>
              `).join('')}` : ''}
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/affiliate" class="btn" style="background: #64748b;">
                  View Dashboard
                </a>
              </div>
            </div>
            <div class="footer">BioinformaticsHub.io Affiliate System</div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Daily Digest for ${data.date}: ${data.clicks} clicks, ${data.conversions} conversions, $${data.revenue.toFixed(0)} revenue.`,
  }),
};

/**
 * Send email using the configured provider
 */
export async function sendEmail(config: EmailConfig): Promise<boolean> {
  try {
    if (!process.env.EMAIL_PROVIDER || process.env.EMAIL_PROVIDER === 'none') {
      console.log('[Email] Email not configured, logging instead:');
      console.log(`  To: ${config.to}`);
      console.log(`  Subject: ${config.subject}`);
      return true;
    }

    switch (process.env.EMAIL_PROVIDER) {
      case 'sendgrid':
        // const sgMail = require('@sendgrid/mail');
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        // await sgMail.send({ ...config, from: process.env.FROM_EMAIL });
        break;
        
      case 'resend':
        // const { Resend } = require('resend');
        // const resend = new Resend(process.env.RESEND_API_KEY);
        // await resend.emails.send({ ...config, from: process.env.FROM_EMAIL });
        break;

      default:
        console.log('[Email] Unknown provider, not sending');
    }

    return true;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

// Notification trigger functions
export async function notifyNewConversion(conversionId: string): Promise<void> {
  const conversion = await prisma.affiliateConversion.findUnique({
    where: { id: conversionId },
    include: {
      partner: { select: { companyName: true } },
      product: { select: { productName: true } },
    },
  });

  if (!conversion) return;

  // Check if high value
  const highValueThreshold = parseFloat(process.env.HIGH_VALUE_THRESHOLD || '1000');
  const saleAmount = conversion.saleAmount || 0;
  
  if (saleAmount >= highValueThreshold) {
    await sendEmail(emailTemplates.highValueConversion({
      partnerName: conversion.partner.companyName,
      productName: conversion.product?.productName,
      saleAmount,
      commissionAmount: conversion.commissionAmount,
      threshold: highValueThreshold,
    }));
  } else {
    await sendEmail(emailTemplates.newConversion({
      partnerName: conversion.partner.companyName,
      productName: conversion.product?.productName,
      saleAmount,
      commissionAmount: conversion.commissionAmount,
      orderId: conversion.orderId || undefined,
      conversionType: conversion.conversionType,
    }));
  }
}

export async function notifyPayoutCreated(payoutId: string): Promise<void> {
  const payout = await prisma.affiliatePayout.findUnique({
    where: { id: payoutId },
    include: {
      partner: { select: { companyName: true } },
    },
  });

  if (!payout || !payout.partner) return;

  await sendEmail(emailTemplates.payoutCreated({
    partnerName: payout.partner.companyName,
    payoutAmount: payout.totalCommission,
    conversionCount: payout.totalConversions,
    periodStart: payout.payoutPeriodStart.toLocaleDateString(),
    periodEnd: payout.payoutPeriodEnd.toLocaleDateString(),
    payoutId: payout.id,
  }));
}

export async function notifyPayoutCompleted(payoutId: string): Promise<void> {
  const payout = await prisma.affiliatePayout.findUnique({
    where: { id: payoutId },
    include: {
      partner: { select: { companyName: true, contactEmail: true } },
    },
  });

  if (!payout || !payout.partner || !payout.partner.contactEmail) return;

  const payoutData = {
    partnerEmail: payout.partner.contactEmail,
    partnerName: payout.partner.companyName,
    payoutAmount: payout.totalCommission,
    conversionCount: payout.totalConversions,
    ...(payout.transactionReference && { transactionId: payout.transactionReference }),
    paymentMethod: payout.payoutMethod || 'Bank Transfer',
  };

  await sendEmail(emailTemplates.payoutCompleted(payoutData));
}

export async function notifyFraudAlert(data: {
  alertType: 'click_fraud' | 'conversion_fraud' | 'suspicious_activity';
  partnerId: string;
  details: string;
  fraudScore: number;
  ipAddress?: string;
}): Promise<void> {
  const partner = await prisma.affiliatePartner.findUnique({
    where: { id: data.partnerId },
    select: { companyName: true },
  });

  await sendEmail(emailTemplates.fraudAlert({
    ...data,
    partnerName: partner?.companyName || 'Unknown Partner',
  }));
}

export async function notifyPartnerWelcome(partnerId: string, apiKey: string): Promise<void> {
  const partner = await prisma.affiliatePartner.findUnique({
    where: { id: partnerId },
    select: {
      id: true,
      companyName: true,
      contactEmail: true,
      commissionRate: true,
      commissionType: true,
    },
  });

  if (!partner || !partner.contactEmail) return;

  await sendEmail(emailTemplates.partnerWelcome({
    partnerEmail: partner.contactEmail,
    partnerName: partner.companyName,
    partnerId: partner.id,
    apiKey,
    commissionRate: partner.commissionRate,
    commissionType: partner.commissionType,
  }));
}

export async function notifyCampaignStarted(campaignId: string): Promise<void> {
  const campaign = await prisma.affiliateCampaign.findUnique({
    where: { id: campaignId },
    include: { partner: { select: { companyName: true } } },
  });

  if (!campaign) return;

  await sendEmail(emailTemplates.campaignStarted({
    campaignName: campaign.campaignName,
    partnerName: campaign.partner?.companyName,
    startDate: campaign.startDate.toLocaleDateString(),
    endDate: campaign.endDate?.toLocaleDateString(),
    discountCode: campaign.discountCode || undefined,
  }));
}
