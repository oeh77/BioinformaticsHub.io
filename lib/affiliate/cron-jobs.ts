/**
 * Affiliate Scheduled Tasks (Cron Jobs)
 * 
 * Handles automated tasks:
 * - Daily digests
 * - Weekly reports
 * - Campaign notifications
 * - Link health checks
 * - Milestone detection
 */

import { prisma } from '@/lib/prisma';
import { 
  emailTemplates, 
  sendEmail,
  notifyFraudAlert,
} from './notifications';
import { checkLinkHealth } from './link-generator';

// ============================================================================
// DAILY DIGEST
// ============================================================================

/**
 * Generate and send daily digest email
 */
export async function runDailyDigest(): Promise<void> {
  console.log('[Cron] Running daily digest...');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's stats
    const [clicks, conversions, pendingApprovals, newPartners] = await Promise.all([
      prisma.affiliateClick.count({
        where: { clickedAt: { gte: today, lt: tomorrow } },
      }),
      prisma.affiliateConversion.aggregate({
        where: { convertedAt: { gte: today, lt: tomorrow } },
        _count: true,
        _sum: { saleAmount: true, commissionAmount: true },
      }),
      prisma.affiliateConversion.count({
        where: { conversionStatus: 'pending' },
      }),
      prisma.affiliatePartner.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
    ]);

    // Check for alerts
    const alerts: Array<{ type: string; message: string }> = [];

    // Check for broken links (sample check)
    const activeLinks = await prisma.affiliateLink.findMany({
      where: { status: 'active' },
      take: 10, // Sample
      select: { shortCode: true, originalUrl: true },
    });

    let brokenLinks = 0;
    for (const link of activeLinks) {
      const health = await checkLinkHealth(link.originalUrl);
      if (!health.healthy) brokenLinks++;
    }
    if (brokenLinks > 0) {
      alerts.push({
        type: 'danger',
        message: `${brokenLinks} link(s) may be broken`,
      });
    }

    // Send digest
    const emailConfig = emailTemplates.dailyDigest({
      date: today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      clicks,
      conversions: conversions._count,
      revenue: conversions._sum.saleAmount || 0,
      pendingApprovals,
      newPartners,
      alerts,
    });

    await sendEmail(emailConfig);
    console.log('[Cron] Daily digest sent successfully');
  } catch (error) {
    console.error('[Cron] Daily digest failed:', error);
  }
}

// ============================================================================
// WEEKLY REPORT
// ============================================================================

/**
 * Generate and send weekly report email
 */
export async function runWeeklyReport(): Promise<void> {
  console.log('[Cron] Running weekly report...');
  
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Get this week's stats
    const [thisWeekClicks, thisWeekConversions] = await Promise.all([
      prisma.affiliateClick.count({
        where: { clickedAt: { gte: weekAgo, lt: now } },
      }),
      prisma.affiliateConversion.aggregate({
        where: { convertedAt: { gte: weekAgo, lt: now } },
        _count: true,
        _sum: { saleAmount: true, commissionAmount: true },
      }),
    ]);

    // Get last week's stats for comparison
    const [lastWeekClicks, lastWeekConversions] = await Promise.all([
      prisma.affiliateClick.count({
        where: { clickedAt: { gte: twoWeeksAgo, lt: weekAgo } },
      }),
      prisma.affiliateConversion.aggregate({
        where: { convertedAt: { gte: twoWeeksAgo, lt: weekAgo } },
        _count: true,
        _sum: { saleAmount: true },
      }),
    ]);

    // Calculate week-over-week changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const weekOverWeekChange = {
      clicks: calculateChange(thisWeekClicks, lastWeekClicks),
      conversions: calculateChange(thisWeekConversions._count, lastWeekConversions._count),
      revenue: calculateChange(
        thisWeekConversions._sum.saleAmount || 0,
        lastWeekConversions._sum.saleAmount || 0
      ),
    };

    // Get top partners
    const topPartnersData = await prisma.affiliateConversion.groupBy({
      by: ['partnerId'],
      where: { convertedAt: { gte: weekAgo, lt: now } },
      _count: true,
      _sum: { saleAmount: true },
      orderBy: { _sum: { saleAmount: 'desc' } },
      take: 5,
    });

    const partnerIds = topPartnersData.map(p => p.partnerId);
    const partners = await prisma.affiliatePartner.findMany({
      where: { id: { in: partnerIds } },
      select: { id: true, companyName: true },
    });

    const partnerMap = new Map(partners.map(p => [p.id, p.companyName]));
    const topPartners = topPartnersData.map(p => ({
      name: partnerMap.get(p.partnerId) || 'Unknown',
      conversions: p._count,
      revenue: p._sum.saleAmount || 0,
    }));

    // Send report
    const emailConfig = emailTemplates.weeklyReport({
      totalClicks: thisWeekClicks,
      totalConversions: thisWeekConversions._count,
      totalRevenue: thisWeekConversions._sum.saleAmount || 0,
      totalCommission: thisWeekConversions._sum.commissionAmount || 0,
      topPartners,
      periodStart: weekAgo.toLocaleDateString(),
      periodEnd: now.toLocaleDateString(),
      weekOverWeekChange,
    });

    await sendEmail(emailConfig);
    console.log('[Cron] Weekly report sent successfully');
  } catch (error) {
    console.error('[Cron] Weekly report failed:', error);
  }
}

// ============================================================================
// CAMPAIGN NOTIFICATIONS
// ============================================================================

/**
 * Check for campaigns ending soon and send notifications
 */
export async function checkCampaignEndingSoon(): Promise<void> {
  console.log('[Cron] Checking for campaigns ending soon...');
  
  try {
    const now = new Date();
    const threeDays = new Date(now);
    threeDays.setDate(threeDays.getDate() + 3);
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find campaigns ending in the next 3 days that haven't been notified
    const endingSoonCampaigns = await prisma.affiliateCampaign.findMany({
      where: {
        status: 'active',
        endDate: { 
          gte: now,
          lte: threeDays,
        },
      },
    });

    for (const campaign of endingSoonCampaigns) {
      if (!campaign.endDate) continue;

      const daysRemaining = Math.ceil(
        (campaign.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get campaign stats
      const links = await prisma.affiliateLink.findMany({
        where: { campaignId: campaign.id },
        select: { id: true },
      });
      const linkIds = links.map(l => l.id);

      const [clickCount, conversionStats] = await Promise.all([
        prisma.affiliateClick.count({ where: { linkId: { in: linkIds } } }),
        prisma.affiliateConversion.aggregate({
          where: { linkId: { in: linkIds } },
          _sum: { saleAmount: true },
          _count: true,
        }),
      ]);

      // Send notification
      const emailConfig = emailTemplates.campaignEndingSoon({
        campaignName: campaign.campaignName,
        endDate: campaign.endDate.toLocaleDateString(),
        daysRemaining,
        totalClicks: clickCount,
        totalConversions: conversionStats._count,
        totalRevenue: conversionStats._sum.saleAmount || 0,
      });

      await sendEmail(emailConfig);
    }

    console.log(`[Cron] Processed ${endingSoonCampaigns.length} ending campaigns`);
  } catch (error) {
    console.error('[Cron] Campaign check failed:', error);
  }
}

/**
 * Start campaigns that are scheduled
 */
export async function startScheduledCampaigns(): Promise<void> {
  console.log('[Cron] Checking for scheduled campaigns to start...');
  
  try {
    const now = new Date();

    // Find active campaigns that should have started
    const campaignsToNotify = await prisma.affiliateCampaign.findMany({
      where: {
        status: 'active',
        startDate: {
          gte: new Date(now.getTime() - 60 * 60 * 1000), // Within last hour
          lte: now,
        },
      },
      include: { partner: { select: { companyName: true } } },
    });

    for (const campaign of campaignsToNotify) {
      const emailConfig = emailTemplates.campaignStarted({
        campaignName: campaign.campaignName,
        partnerName: campaign.partner?.companyName,
        startDate: campaign.startDate.toLocaleDateString(),
        endDate: campaign.endDate?.toLocaleDateString(),
        discountCode: campaign.discountCode || undefined,
      });

      await sendEmail(emailConfig);
    }

    console.log(`[Cron] Started ${campaignsToNotify.length} campaigns`);
  } catch (error) {
    console.error('[Cron] Campaign start check failed:', error);
  }
}

// ============================================================================
// LINK HEALTH CHECK
// ============================================================================

/**
 * Check health of affiliate links and notify on issues
 */
export async function runLinkHealthCheck(): Promise<void> {
  console.log('[Cron] Running link health check...');
  
  try {
    // Get active links, prioritize high-traffic ones
    const links = await prisma.affiliateLink.findMany({
      where: { status: 'active' },
      orderBy: { clicks: { _count: 'desc' } },
      take: 50,
      select: { id: true, shortCode: true, originalUrl: true },
    });

    const unhealthyLinks: Array<{ shortCode: string; url: string; status: number }> = [];

    for (const link of links) {
      const health = await checkLinkHealth(link.originalUrl);
      
      if (!health.healthy) {
        unhealthyLinks.push({
          shortCode: link.shortCode,
          url: link.originalUrl,
          status: health.status || 0,
        });

        // Update link status
        await prisma.affiliateLink.update({
          where: { id: link.id },
          data: { 
            status: health.status === 404 ? 'expired' : 'paused',
          },
        });
      }
    }

    if (unhealthyLinks.length > 0) {
      const emailConfig = emailTemplates.linkHealthWarning({ unhealthyLinks });
      await sendEmail(emailConfig);
    }

    console.log(`[Cron] Checked ${links.length} links, ${unhealthyLinks.length} unhealthy`);
  } catch (error) {
    console.error('[Cron] Link health check failed:', error);
  }
}

// ============================================================================
// MILESTONE DETECTION
// ============================================================================

/**
 * Check for revenue and conversion milestones
 */
export async function checkMilestones(): Promise<void> {
  console.log('[Cron] Checking for milestones...');
  
  try {
    const milestones = {
      revenue: [1000, 5000, 10000, 25000, 50000, 100000],
      conversions: [10, 50, 100, 250, 500, 1000],
    };

    // Check monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await prisma.affiliateConversion.aggregate({
      where: { 
        convertedAt: { gte: startOfMonth },
        conversionStatus: 'approved',
      },
      _sum: { saleAmount: true },
      _count: true,
    });

    const monthlyRevenue = monthlyStats._sum.saleAmount || 0;
    const monthlyConversions = monthlyStats._count;

    // Check for revenue milestones
    for (const milestone of milestones.revenue) {
      if (monthlyRevenue >= milestone) {
        // Check if we crossed this threshold recently
        const previousStats = await prisma.affiliateConversion.aggregate({
          where: { 
            convertedAt: { 
              gte: startOfMonth,
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
            },
            conversionStatus: 'approved',
          },
          _sum: { saleAmount: true },
        });

        const previousRevenue = previousStats._sum.saleAmount || 0;
        
        if (previousRevenue < milestone && monthlyRevenue >= milestone) {
          const emailConfig = emailTemplates.milestoneAchieved({
            milestoneType: 'revenue',
            milestoneValue: milestone,
            period: `${startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          });
          await sendEmail(emailConfig);
          break; // Only notify for the highest milestone crossed
        }
      }
    }

    // Check for conversion milestones
    for (const milestone of milestones.conversions) {
      if (monthlyConversions >= milestone) {
        const previousStats = await prisma.affiliateConversion.count({
          where: { 
            convertedAt: { 
              gte: startOfMonth,
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
            conversionStatus: 'approved',
          },
        });

        if (previousStats < milestone && monthlyConversions >= milestone) {
          const emailConfig = emailTemplates.milestoneAchieved({
            milestoneType: 'conversions',
            milestoneValue: milestone,
            period: `${startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          });
          await sendEmail(emailConfig);
          break;
        }
      }
    }

    console.log('[Cron] Milestone check completed');
  } catch (error) {
    console.error('[Cron] Milestone check failed:', error);
  }
}

// ============================================================================
// FRAUD MONITORING
// ============================================================================

/**
 * Monitor for suspicious activity patterns
 */
export async function runFraudMonitoring(): Promise<void> {
  console.log('[Cron] Running fraud monitoring...');
  
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check for click bombing (unusual click velocity)
    const clicksByPartner = await prisma.affiliateClick.groupBy({
      by: ['linkId'],
      where: { clickedAt: { gte: oneHourAgo } },
      _count: true,
      having: { linkId: { _count: { gt: 100 } } },
    });

    for (const data of clicksByPartner) {
      const link = await prisma.affiliateLink.findUnique({
        where: { id: data.linkId },
        select: { partnerId: true },
      });

      if (link) {
        await notifyFraudAlert({
          alertType: 'click_fraud',
          partnerId: link.partnerId,
          details: `${data._count} clicks in the last hour from a single link`,
          fraudScore: Math.min(data._count, 100),
        });
      }
    }

    // Check for suspicious IP patterns
    const suspiciousIPs = await prisma.affiliateClick.groupBy({
      by: ['ipAddress'],
      where: { clickedAt: { gte: oneHourAgo } },
      _count: true,
      having: { ipAddress: { _count: { gt: 50 } } },
    });

    if (suspiciousIPs.length > 0) {
      console.log(`[Cron] Found ${suspiciousIPs.length} suspicious IPs`);
    }

    console.log('[Cron] Fraud monitoring completed');
  } catch (error) {
    console.error('[Cron] Fraud monitoring failed:', error);
  }
}

// ============================================================================
// CRON SCHEDULE SETUP
// ============================================================================

/**
 * Initialize all cron jobs
 * 
 * Call this from your app initialization (e.g., in next.config.js or a startup script)
 */
export function initializeCronJobs(): void {
  // Try to import node-cron
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cron = require('node-cron');

    // Daily digest - Every day at 8am
    cron.schedule('0 8 * * *', () => {
      runDailyDigest();
    });

    // Weekly report - Every Monday at 9am
    cron.schedule('0 9 * * 1', () => {
      runWeeklyReport();
    });

    // Campaign checks - Every hour
    cron.schedule('0 * * * *', () => {
      checkCampaignEndingSoon();
      startScheduledCampaigns();
    });

    // Link health check - Every 6 hours
    cron.schedule('0 */6 * * *', () => {
      runLinkHealthCheck();
    });

    // Milestone check - Every day at noon
    cron.schedule('0 12 * * *', () => {
      checkMilestones();
    });

    // Fraud monitoring - Every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      runFraudMonitoring();
    });

    console.log('[Cron] All affiliate cron jobs initialized');
  } catch (error) {
    console.warn('[Cron] node-cron not available, using manual triggers only');
  }
}

// Export a manual trigger function for testing
export async function triggerManualCronJob(
  jobName: 'daily' | 'weekly' | 'campaigns' | 'links' | 'milestones' | 'fraud'
): Promise<void> {
  switch (jobName) {
    case 'daily':
      await runDailyDigest();
      break;
    case 'weekly':
      await runWeeklyReport();
      break;
    case 'campaigns':
      await checkCampaignEndingSoon();
      await startScheduledCampaigns();
      break;
    case 'links':
      await runLinkHealthCheck();
      break;
    case 'milestones':
      await checkMilestones();
      break;
    case 'fraud':
      await runFraudMonitoring();
      break;
  }
}
