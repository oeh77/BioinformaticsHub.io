import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  ExternalLink,
  Mail,
  CheckCircle2,
  Globe,
} from "lucide-react";

export const revalidate = 3600; // 1 hour

interface Props {
  params: Promise<{ slug: string }>;
}

async function getJob(slug: string) {
  const job = await prisma.job.findUnique({
    where: { slug },
  });

  if (!job || !job.published) {
    return null;
  }

  // Check expiration
  if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
    return null;
  }

  return job;
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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    return { title: "Job Not Found" };
  }

  return {
    title: `${job.title} at ${job.company} | BioinformaticsHub Jobs`,
    description: job.description.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    notFound();
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || undefined);
  const tags = job.tags?.split(",").map((t) => t.trim()).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <PageHeader
        title={job.title}
        subtitle={`${job.company} • ${job.location}`}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/jobs">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Header */}
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-start gap-6">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-20 h-20 rounded-2xl object-cover bg-background"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{job.company}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/50">
                      <Briefcase className="h-4 w-4" />
                      {job.employmentType}
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/50">
                      <Globe className="h-4 w-4" />
                      {job.locationType}
                    </span>
                    {salary && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                        <DollarSign className="h-4 w-4" />
                        {salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">About the Role</h2>
              <div
                className="prose dark:prose-invert prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="glass-card p-8 rounded-2xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Requirements
                </h2>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="glass-card p-8 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">Benefits & Perks</h2>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.benefits }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply CTA */}
            <div className="glass-card p-6 rounded-2xl border-2 border-primary/20">
              <h3 className="font-bold text-lg mb-4">Interested in this role?</h3>
              <div className="space-y-3">
                {job.applicationUrl && (
                  <Button className="w-full" size="lg" asChild>
                    <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                      Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                {job.applicationEmail && (
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <a href={`mailto:${job.applicationEmail}`}>
                      <Mail className="mr-2 h-4 w-4" /> Email Application
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4">Job Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-muted-foreground">Posted</span>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {job.expiresAt && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-muted-foreground">Expires</span>
                    <span>{new Date(job.expiresAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-muted-foreground">Job Type</span>
                  <span>{job.employmentType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Location Type</span>
                  <span>{job.locationType}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-bold text-lg mb-4">Skills & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
