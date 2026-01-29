"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Play, 
  Pause,
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Loader2,
  Zap,
  Settings,
  Calendar
} from "lucide-react";

interface AutoBlogJob {
  id: string;
  status: string;
  categoryId: string;
  categoryName: string | null;
  topic: string | null;
  postId: string | null;
  error: string | null;
  createdAt: string;
}

interface AutoBlogStatus {
  lastRun: string | null;
  pendingJobs: number;
  completedToday: number;
  failedToday: number;
}

interface SchedulerConfig {
  enabled: boolean;
  cronExpression: string;
  autoPublish: boolean;
  maxPostsPerRun: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

interface CronPreset {
  label: string;
  value: string;
}

export default function AutoBlogPage() {
  const [jobs, setJobs] = useState<AutoBlogJob[]>([]);
  const [status, setStatus] = useState<AutoBlogStatus | null>(null);
  const [categoryCount, setCategoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Scheduler state
  const [schedulerConfig, setSchedulerConfig] = useState<SchedulerConfig | null>(null);
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [cronPresets, setCronPresets] = useState<CronPreset[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable config
  const [editConfig, setEditConfig] = useState({
    enabled: true,
    cronExpression: "0 2 * * *",
    autoPublish: true,
    maxPostsPerRun: 25
  });

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, scheduleRes] = await Promise.all([
        fetch(`/api/admin/autoblog`, { credentials: "include" }),
        fetch(`/api/admin/autoblog/schedule`, { credentials: "include" })
      ]);
      
      const jobsData = await jobsRes.json();
      const scheduleData = await scheduleRes.json();
      
      setJobs(jobsData.jobs || []);
      setStatus(jobsData.status);
      setCategoryCount(jobsData.categoryCount || 0);
      
      if (scheduleData.config) {
        setSchedulerConfig(scheduleData.config);
        setEditConfig({
          enabled: scheduleData.config.enabled,
          cronExpression: scheduleData.config.cronExpression,
          autoPublish: scheduleData.config.autoPublish,
          maxPostsPerRun: scheduleData.config.maxPostsPerRun
        });
      }
      setSchedulerRunning(scheduleData.status?.running || false);
      setCronPresets(scheduleData.presets || []);
    } catch (error) {
      console.error("Failed to fetch autoblog data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateAll = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/admin/autoblog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "generate-all" })
      });
      const data = await response.json();
      alert(data.message || "Generation started");
      await fetchData();
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Failed to start generation");
    } finally {
      setGenerating(false);
    }
  };

  const handleSchedulerToggle = async () => {
    try {
      const action = schedulerRunning ? "stop" : "start";
      const response = await fetch("/api/admin/autoblog/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      if (data.success) {
        setSchedulerRunning(!schedulerRunning);
      }
      alert(data.message);
    } catch (error) {
      console.error("Failed to toggle scheduler:", error);
      alert("Failed to toggle scheduler");
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/autoblog/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", config: editConfig })
      });
      const data = await response.json();
      if (data.success) {
        await fetchData();
        setShowSettings(false);
      }
      alert(data.message);
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (jobStatus: string) => {
    switch (jobStatus) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeClass = (jobStatus: string) => {
    switch (jobStatus) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const filteredJobs = statusFilter === "all" 
    ? jobs 
    : jobs.filter(j => j.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

// Refactored AutoBlogPage

  const inputClasses = "w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Auto-Blog
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated AI-powered blog generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleGenerateAll}
            disabled={generating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md border border-white/10"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Generate All Posts
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-card text-card-foreground p-6 space-y-4 border-2 border-primary/30 rounded-xl shadow-lg">
          <h2 className="font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Automation Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enable/Disable */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                <input
                  type="checkbox"
                  checked={editConfig.enabled}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Enable Automation</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1 ml-2">
                Allow scheduled automatic blog generation
              </p>
            </div>

            {/* Auto-publish */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                <input
                  type="checkbox"
                  checked={editConfig.autoPublish}
                  onChange={(e) => setEditConfig(prev => ({ ...prev, autoPublish: e.target.checked }))}
                  className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Auto-Publish Posts</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1 ml-2">
                Publish posts immediately or save as drafts
              </p>
            </div>

            {/* Schedule Preset */}
            <div>
              <label className="block text-sm font-medium mb-2">Schedule</label>
              <select
                value={editConfig.cronExpression}
                onChange={(e) => setEditConfig(prev => ({ ...prev, cronExpression: e.target.value }))}
                title="Automation schedule"
                aria-label="Automation schedule"
                className={inputClasses}
              >
                {cronPresets.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Posts */}
            <div>
              <label className="block text-sm font-medium mb-2">Max Posts Per Run</label>
              <input
                type="number"
                min={1}
                max={100}
                value={editConfig.maxPostsPerRun}
                onChange={(e) => setEditConfig(prev => ({ ...prev, maxPostsPerRun: parseInt(e.target.value) || 25 }))}
                title="Maximum posts to generate per run"
                placeholder="25"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={saving} className="text-primary-foreground shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Settings
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold">{categoryCount}</p>
          <p className="text-xs text-muted-foreground">POST categories</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Completed Today</p>
          <p className="text-2xl font-bold text-green-500 dark:text-green-400">{status?.completedToday || 0}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Failed Today</p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400">{status?.failedToday || 0}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Scheduler</p>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${schedulerRunning ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-sm font-medium">{schedulerRunning ? "Running" : "Stopped"}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSchedulerToggle}
            className="mt-1 h-7 text-xs"
          >
            {schedulerRunning ? (
              <><Pause className="w-3 h-3 mr-1" /> Stop</>
            ) : (
              <><Play className="w-3 h-3 mr-1" /> Start</>
            )}
          </Button>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Next Run</p>
          <p className="text-sm font-medium">
            {schedulerConfig?.nextRunAt 
              ? new Date(schedulerConfig.nextRunAt).toLocaleString() 
              : "Not scheduled"}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {schedulerConfig?.cronExpression || "0 2 * * *"}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter by job status"
            aria-label="Filter by job status"
            className="px-3 py-1.5 rounded-lg bg-background border border-input text-sm focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <span className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} jobs
          </span>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Topic</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No auto-blog jobs found</p>
                  <p className="text-sm">Click &quot;Generate All Posts&quot; to create posts for all categories</p>
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${getStatusBadgeClass(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{job.categoryName || job.categoryId}</td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                    {job.topic || "-"}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {job.postId && (
                        <a
                          href={`/admin/posts/${job.postId}/edit`}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 border border-primary/10 transition-colors"
                        >
                          View Post
                        </a>
                      )}
                      {job.error && (
                        <span
                          title={job.error}
                          className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded cursor-help border border-destructive/10"
                        >
                          Error
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Last Run Info */}
      {status?.lastRun && (
        <p className="text-sm text-muted-foreground text-center">
          Last manual run: {new Date(status.lastRun).toLocaleString()}
        </p>
      )}
    </div>
  );
}
