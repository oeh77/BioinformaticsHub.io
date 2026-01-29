import cron, { ScheduledTask } from "node-cron";
import { runDailyAutoBlog } from "./autoblog";
import { prisma } from "./prisma";

// Global scheduler instance
let schedulerTask: ScheduledTask | null = null;
let isSchedulerRunning = false;

/**
 * Get scheduler configuration from database
 */
export async function getSchedulerConfig(): Promise<{
  enabled: boolean;
  cronExpression: string;
  autoPublish: boolean;
  maxPostsPerRun: number;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
}> {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: [
          "autoblog_enabled",
          "autoblog_cron",
          "autoblog_auto_publish",
          "autoblog_max_posts",
          "autoblog_last_run"
        ]
      }
    }
  });

  const getValue = (key: string, defaultValue: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const cronExpression = getValue("autoblog_cron", "0 2 * * *"); // Default: 2 AM daily
  
  return {
    enabled: getValue("autoblog_enabled", "true") === "true",
    cronExpression,
    autoPublish: getValue("autoblog_auto_publish", "true") === "true",
    maxPostsPerRun: parseInt(getValue("autoblog_max_posts", "25")),
    lastRunAt: getValue("autoblog_last_run", "") 
      ? new Date(getValue("autoblog_last_run", "")) 
      : null,
    nextRunAt: getNextRunTime(cronExpression)
  };
}

/**
 * Save scheduler configuration to database
 */
export async function saveSchedulerConfig(config: {
  enabled?: boolean;
  cronExpression?: string;
  autoPublish?: boolean;
  maxPostsPerRun?: number;
}): Promise<void> {
  const updates: { key: string; value: string }[] = [];

  if (config.enabled !== undefined) {
    updates.push({ key: "autoblog_enabled", value: config.enabled.toString() });
  }
  if (config.cronExpression !== undefined) {
    updates.push({ key: "autoblog_cron", value: config.cronExpression });
  }
  if (config.autoPublish !== undefined) {
    updates.push({ key: "autoblog_auto_publish", value: config.autoPublish.toString() });
  }
  if (config.maxPostsPerRun !== undefined) {
    updates.push({ key: "autoblog_max_posts", value: config.maxPostsPerRun.toString() });
  }

  for (const { key, value } of updates) {
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  // Restart scheduler with new config if needed
  if (config.enabled !== undefined || config.cronExpression !== undefined) {
    await restartScheduler();
  }
}

/**
 * Calculate next run time from cron expression
 */
function getNextRunTime(cronExpression: string): Date | null {
  try {
    // Parse cron expression to get next run time
    const parts = cronExpression.split(" ");
    if (parts.length !== 5) return null;

    const [minute, hour] = parts;
    const now = new Date();
    const next = new Date();
    
    next.setHours(parseInt(hour) || 2);
    next.setMinutes(parseInt(minute) || 0);
    next.setSeconds(0);
    next.setMilliseconds(0);

    // If time has passed today, move to tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  } catch {
    return null;
  }
}

/**
 * Run the scheduled auto-blog generation
 */
async function executeScheduledRun(): Promise<void> {
  console.log("🤖 Auto-blog scheduler: Starting scheduled run...");
  
  try {
    const config = await getSchedulerConfig();
    
    if (!config.enabled) {
      console.log("⏸️ Auto-blog scheduler: Disabled, skipping run");
      return;
    }

    // Update last run time
    await prisma.settings.upsert({
      where: { key: "autoblog_last_run" },
      update: { value: new Date().toISOString() },
      create: { key: "autoblog_last_run", value: new Date().toISOString() }
    });

    // Run the generation
    const results = await runDailyAutoBlog();
    
    console.log(`✅ Auto-blog scheduler: Completed - ${results.success} success, ${results.failed} failed`);
  } catch (error) {
    console.error("❌ Auto-blog scheduler: Error during run", error);
  }
}

/**
 * Start the auto-blog scheduler
 */
export async function startScheduler(): Promise<boolean> {
  if (isSchedulerRunning) {
    console.log("⚠️ Scheduler already running");
    return true;
  }

  try {
    const config = await getSchedulerConfig();
    
    if (!config.enabled) {
      console.log("⏸️ Auto-blog scheduler: Disabled in configuration");
      return false;
    }

    // Validate cron expression
    if (!cron.validate(config.cronExpression)) {
      console.error("❌ Invalid cron expression:", config.cronExpression);
      return false;
    }

    // Create scheduled task
    schedulerTask = cron.schedule(config.cronExpression, executeScheduledRun, {
      timezone: "UTC"
    });

    isSchedulerRunning = true;
    console.log(`🚀 Auto-blog scheduler started with: ${config.cronExpression}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to start scheduler:", error);
    return false;
  }
}

/**
 * Stop the auto-blog scheduler
 */
export function stopScheduler(): boolean {
  if (!isSchedulerRunning || !schedulerTask) {
    console.log("⚠️ Scheduler not running");
    return false;
  }

  schedulerTask.stop();
  schedulerTask = null;
  isSchedulerRunning = false;
  console.log("⏹️ Auto-blog scheduler stopped");
  return true;
}

/**
 * Restart the scheduler with new configuration
 */
export async function restartScheduler(): Promise<boolean> {
  stopScheduler();
  return await startScheduler();
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  running: boolean;
} {
  return {
    running: isSchedulerRunning
  };
}

/**
 * Common cron presets for UI
 */
export const CRON_PRESETS = [
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Every 12 hours", value: "0 */12 * * *" },
  { label: "Daily at 2 AM", value: "0 2 * * *" },
  { label: "Daily at 6 AM", value: "0 6 * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "Every weekday at 8 AM", value: "0 8 * * 1-5" }
];
