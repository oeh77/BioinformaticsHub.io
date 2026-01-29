/**
 * Admin API - Manual Cron Job Trigger
 * 
 * POST /api/admin/affiliate/cron - Manually trigger cron jobs for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  runDailyDigest,
  runWeeklyReport,
  checkCampaignEndingSoon,
  startScheduledCampaigns,
  runLinkHealthCheck,
  checkMilestones,
  runFraudMonitoring,
} from '@/lib/affiliate/cron-jobs';

type CronJobName = 
  | 'daily'
  | 'weekly'
  | 'campaigns'
  | 'campaignEnding'
  | 'campaignStart'
  | 'links'
  | 'milestones'
  | 'fraud'
  | 'all';

interface CronJobResult {
  job: string;
  status: 'success' | 'error';
  message?: string;
  duration?: number;
}

// GET - List available cron jobs
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      availableJobs: [
        {
          name: 'daily',
          description: 'Generate and send daily digest email',
          schedule: 'Every day at 8:00 AM',
        },
        {
          name: 'weekly',
          description: 'Generate and send weekly performance report',
          schedule: 'Every Monday at 9:00 AM',
        },
        {
          name: 'campaignEnding',
          description: 'Check for campaigns ending soon and notify',
          schedule: 'Every hour',
        },
        {
          name: 'campaignStart',
          description: 'Notify when scheduled campaigns go live',
          schedule: 'Every hour',
        },
        {
          name: 'campaigns',
          description: 'Run both campaign checks (ending soon + start)',
          schedule: 'Combined',
        },
        {
          name: 'links',
          description: 'Check health of active affiliate links',
          schedule: 'Every 6 hours',
        },
        {
          name: 'milestones',
          description: 'Check for revenue and conversion milestones',
          schedule: 'Every day at 12:00 PM',
        },
        {
          name: 'fraud',
          description: 'Monitor for suspicious activity patterns',
          schedule: 'Every 30 minutes',
        },
        {
          name: 'all',
          description: 'Run all cron jobs sequentially',
          schedule: 'On demand',
        },
      ],
      usage: 'POST /api/admin/affiliate/cron with body { "job": "daily" }',
    });
  } catch (error) {
    console.error('Failed to list cron jobs:', error);
    return NextResponse.json(
      { error: 'Failed to list cron jobs' },
      { status: 500 }
    );
  }
}

// POST - Trigger a specific cron job
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const jobName = body.job as CronJobName;

    if (!jobName) {
      return NextResponse.json(
        { error: 'Missing job name. Use GET to see available jobs.' },
        { status: 400 }
      );
    }

    const validJobs: CronJobName[] = [
      'daily', 'weekly', 'campaigns', 'campaignEnding', 
      'campaignStart', 'links', 'milestones', 'fraud', 'all'
    ];

    if (!validJobs.includes(jobName)) {
      return NextResponse.json(
        { error: `Invalid job name. Valid options: ${validJobs.join(', ')}` },
        { status: 400 }
      );
    }

    const results: CronJobResult[] = [];

    async function runJob(name: string, fn: () => Promise<void>): Promise<CronJobResult> {
      const start = Date.now();
      try {
        await fn();
        return {
          job: name,
          status: 'success',
          duration: Date.now() - start,
        };
      } catch (error) {
        return {
          job: name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - start,
        };
      }
    }

    switch (jobName) {
      case 'daily':
        results.push(await runJob('Daily Digest', runDailyDigest));
        break;
      
      case 'weekly':
        results.push(await runJob('Weekly Report', runWeeklyReport));
        break;
      
      case 'campaignEnding':
        results.push(await runJob('Campaign Ending Soon', checkCampaignEndingSoon));
        break;
      
      case 'campaignStart':
        results.push(await runJob('Campaign Started', startScheduledCampaigns));
        break;
      
      case 'campaigns':
        results.push(await runJob('Campaign Ending Soon', checkCampaignEndingSoon));
        results.push(await runJob('Campaign Started', startScheduledCampaigns));
        break;
      
      case 'links':
        results.push(await runJob('Link Health Check', runLinkHealthCheck));
        break;
      
      case 'milestones':
        results.push(await runJob('Milestone Check', checkMilestones));
        break;
      
      case 'fraud':
        results.push(await runJob('Fraud Monitoring', runFraudMonitoring));
        break;
      
      case 'all':
        results.push(await runJob('Daily Digest', runDailyDigest));
        results.push(await runJob('Weekly Report', runWeeklyReport));
        results.push(await runJob('Campaign Ending Soon', checkCampaignEndingSoon));
        results.push(await runJob('Campaign Started', startScheduledCampaigns));
        results.push(await runJob('Link Health Check', runLinkHealthCheck));
        results.push(await runJob('Milestone Check', checkMilestones));
        results.push(await runJob('Fraud Monitoring', runFraudMonitoring));
        break;
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'error').length;
    const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

    return NextResponse.json({
      success: failedCount === 0,
      summary: {
        total: results.length,
        succeeded: successCount,
        failed: failedCount,
        totalDuration: `${totalDuration}ms`,
      },
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to run cron job:', error);
    return NextResponse.json(
      { error: 'Failed to run cron job' },
      { status: 500 }
    );
  }
}
