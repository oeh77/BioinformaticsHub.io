/**
 * Fetches GitHub repository statistics (stars, forks, watchers)
 */
export async function getGitHubStats(repoUrl: string): Promise<{
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  lastUpdated: string;
} | null> {
  try {
    // Parse repo URL: https://github.com/owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      watchers: data.subscribers_count || 0,
      openIssues: data.open_issues_count || 0,
      lastUpdated: data.pushed_at || data.updated_at,
    };
  } catch (error) {
    console.error("Failed to fetch GitHub stats:", error);
    return null;
  }
}

/**
 * Fetches NPM package download statistics
 */
export async function getNpmDownloads(packageName: string): Promise<{
  weeklyDownloads: number;
  monthlyDownloads: number;
} | null> {
  try {
    // Extract package name from npm URL if provided
    let name = packageName;
    if (packageName.includes("npmjs.com/package/")) {
      const match = packageName.match(/npmjs\.com\/package\/([^\/\?]+)/);
      if (match) {
        name = match[1];
      }
    }

    // Fetch weekly downloads
    const weeklyResponse = await fetch(
      `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`,
      { next: { revalidate: 3600 } }
    );

    // Fetch monthly downloads
    const monthlyResponse = await fetch(
      `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`,
      { next: { revalidate: 3600 } }
    );

    if (!weeklyResponse.ok || !monthlyResponse.ok) {
      return null;
    }

    const weeklyData = await weeklyResponse.json();
    const monthlyData = await monthlyResponse.json();

    return {
      weeklyDownloads: weeklyData.downloads || 0,
      monthlyDownloads: monthlyData.downloads || 0,
    };
  } catch (error) {
    console.error("Failed to fetch NPM downloads:", error);
    return null;
  }
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Fetches PyPI package download statistics
 */
export async function getPyPIDownloads(packageName: string): Promise<{
  totalDownloads: number;
  lastMonthDownloads: number;
} | null> {
  try {
    // Extract package name from PyPI URL if provided
    let name = packageName;
    if (packageName.includes("pypi.org/project/")) {
      const match = packageName.match(/pypi\.org\/project\/([^\/\?]+)/);
      if (match) {
        name = match[1];
      }
    }

    // Use pypistats API
    const response = await fetch(
      `https://pypistats.org/api/packages/${encodeURIComponent(name.toLowerCase())}/recent`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      totalDownloads: data.data?.last_month || 0,
      lastMonthDownloads: data.data?.last_month || 0,
    };
  } catch (error) {
    console.error("Failed to fetch PyPI downloads:", error);
    return null;
  }
}

/**
 * Fetches Bioconductor package statistics
 */
export async function getBioconductorStats(packageName: string): Promise<{
  downloads: number;
} | null> {
  try {
    // Bioconductor doesn't have a public API, this is a placeholder
    // In production, you might scrape the stats page or use their internal API
    return null;
  } catch (error) {
    console.error("Failed to fetch Bioconductor stats:", error);
    return null;
  }
}
