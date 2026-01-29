import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  DollarSign, 
  ArrowRight,
  Star
} from "lucide-react";

export const revalidate = 1800; // 30 minutes

async function getJobs() {
  return prisma.job.findMany({
    where: {
      published: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
    take: 50,
  });
}

function formatSalary(min?: number | null, max?: number | null, currency = "USD") {
  if (!min && !max) return null;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) return `${formatter.format(min)}+`;
  if (max) return `Up to ${formatter.format(max)}`;
  return null;
}

function getTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default async function JobsPage() {
  const jobs = await getJobs();

  const featuredJobs = jobs.filter((j) => j.featured);
  const regularJobs = jobs.filter((j) => !j.featured);

  return (
    <div className="min-h-screen">
      <PageHeader
        title={<>Bioinformatics <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Job Board</span></>}
        subtitle="Find your next career opportunity in computational biology, genomics, and life sciences"
        backgroundImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2670&auto=format&fit=crop"
      />

      <div className="container mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-1">{jobs.length}</div>
            <div className="text-sm text-muted-foreground">Open Positions</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-1">
              {new Set(jobs.map((j) => j.company)).size}
            </div>
            <div className="text-sm text-muted-foreground">Companies Hiring</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-1">
              {jobs.filter((j) => j.locationType === "Remote").length}
            </div>
            <div className="text-sm text-muted-foreground">Remote Jobs</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-1">{featuredJobs.length}</div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </div>
        </div>

        {/* Featured Jobs */}
        {featuredJobs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              Featured Positions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="group glass-card p-6 border-2 border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-16 h-16 rounded-xl object-cover bg-background"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-medium">
                          Featured
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(new Date(job.createdAt))}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                        {job.title}
                      </h3>
                      <p className="text-muted-foreground">{job.company}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.employmentType}
                        </span>
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || undefined) && (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || undefined)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Jobs */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            All Positions
          </h2>

          {regularJobs.length === 0 && featuredJobs.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-6">
                Check back soon for bioinformatics career opportunities!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {regularJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="group flex items-center gap-4 p-5 glass-card hover:border-primary/50 transition-all duration-300"
                >
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-14 h-14 rounded-xl object-cover bg-background shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>

                  <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary/50 text-xs">
                      {job.employmentType}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary/50 text-xs">
                      {job.locationType}
                    </span>
                  </div>

                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || undefined) && (
                    <div className="hidden md:block text-right">
                      <div className="text-primary font-semibold">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || undefined)}
                      </div>
                      <div className="text-xs text-muted-foreground">per year</div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground shrink-0">
                    {getTimeAgo(new Date(job.createdAt))}
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <div className="glass-card p-12 rounded-3xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Hiring in Bioinformatics?</h2>
            <p className="text-muted-foreground mb-6">
              Reach thousands of computational biology professionals. Post your job and find the perfect candidate.
            </p>
            <Button size="lg" className="rounded-full">
              Post a Job <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
