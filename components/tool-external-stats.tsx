"use client";

import { useEffect, useState } from "react";
import { Star, GitFork, Download, Package } from "lucide-react";
import { formatNumber } from "@/lib/external-stats";

interface ToolStatsProps {
  githubUrl?: string | null;
  npmPackage?: string | null;
  pypiPackage?: string | null;
}

interface GitHubStats {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  lastUpdated: string;
}

interface NpmStats {
  weeklyDownloads: number;
  monthlyDownloads: number;
}

interface PyPIStats {
  lastMonthDownloads: number;
}

export function ToolExternalStats({ githubUrl, npmPackage, pypiPackage }: ToolStatsProps) {
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [npmStats, setNpmStats] = useState<NpmStats | null>(null);
  const [pypiStats, setPypiStats] = useState<PyPIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      
      try {
        // Fetch GitHub stats
        if (githubUrl) {
          const res = await fetch(`/api/stats/github?url=${encodeURIComponent(githubUrl)}`);
          if (res.ok) {
            const data = await res.json();
            setGithubStats(data);
          }
        }

        // Fetch NPM stats
        if (npmPackage) {
          const res = await fetch(`/api/stats/npm?package=${encodeURIComponent(npmPackage)}`);
          if (res.ok) {
            const data = await res.json();
            setNpmStats(data);
          }
        }

        // Fetch PyPI stats
        if (pypiPackage) {
          const res = await fetch(`/api/stats/pypi?package=${encodeURIComponent(pypiPackage)}`);
          if (res.ok) {
            const data = await res.json();
            setPypiStats(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch external stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (githubUrl || npmPackage || pypiPackage) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [githubUrl, npmPackage, pypiPackage]);

  if (!githubUrl && !npmPackage && !pypiPackage) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex gap-4 animate-pulse">
        {githubUrl && <div className="h-8 w-24 bg-secondary/50 rounded-lg" />}
        {npmPackage && <div className="h-8 w-24 bg-secondary/50 rounded-lg" />}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* GitHub Stars */}
      {githubStats && (
        <a
          href={githubUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors text-sm"
        >
          <Star className="h-4 w-4 text-amber-500" />
          <span className="font-medium">{formatNumber(githubStats.stars)}</span>
          <span className="text-muted-foreground">stars</span>
        </a>
      )}

      {/* GitHub Forks */}
      {githubStats && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm">
          <GitFork className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{formatNumber(githubStats.forks)}</span>
          <span className="text-muted-foreground">forks</span>
        </div>
      )}

      {/* NPM Downloads */}
      {npmStats && (
        <a
          href={npmPackage?.includes("npmjs.com") ? npmPackage : `https://npmjs.com/package/${npmPackage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-sm"
        >
          <Download className="h-4 w-4 text-red-500" />
          <span className="font-medium">{formatNumber(npmStats.weeklyDownloads)}</span>
          <span className="text-muted-foreground">weekly</span>
        </a>
      )}

      {/* PyPI Downloads */}
      {pypiStats && (
        <a
          href={pypiPackage?.includes("pypi.org") ? pypiPackage : `https://pypi.org/project/${pypiPackage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-sm"
        >
          <Package className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{formatNumber(pypiStats.lastMonthDownloads)}</span>
          <span className="text-muted-foreground">monthly</span>
        </a>
      )}
    </div>
  );
}
