import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  getSchedulerConfig, 
  saveSchedulerConfig, 
  startScheduler, 
  stopScheduler,
  getSchedulerStatus,
  CRON_PRESETS
} from "@/lib/autoblog-scheduler";

// GET - Get scheduler configuration and status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getSchedulerConfig();
    const status = getSchedulerStatus();

    return NextResponse.json({
      config,
      status,
      presets: CRON_PRESETS
    });
  } catch (error) {
    console.error("Error fetching scheduler config:", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

// POST - Update scheduler configuration or control scheduler
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, config } = body;

    if (action === "start") {
      const started = await startScheduler();
      return NextResponse.json({ 
        success: started, 
        message: started ? "Scheduler started" : "Failed to start scheduler" 
      });
    }

    if (action === "stop") {
      const stopped = stopScheduler();
      return NextResponse.json({ 
        success: stopped, 
        message: stopped ? "Scheduler stopped" : "Scheduler was not running" 
      });
    }

    if (action === "save" && config) {
      await saveSchedulerConfig(config);
      return NextResponse.json({ success: true, message: "Configuration saved" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating scheduler:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
