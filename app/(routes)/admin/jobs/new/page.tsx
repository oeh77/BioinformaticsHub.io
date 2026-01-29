"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function NewJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    locationType: "Remote",
    employmentType: "Full-time",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    description: "",
    requirements: "",
    benefits: "",
    applicationUrl: "",
    applicationEmail: "",
    companyLogo: "",
    tags: "",
    featured: false,
    published: true,
    expiresAt: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create job");
      }

      router.push("/admin/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Job</h1>
          <p className="text-muted-foreground mt-1">Create a new job posting</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-white/10 pb-2">
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Bioinformatics Scientist"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <Input
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Illumina"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location Type</label>
              <select
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Logo URL</label>
            <Input
              name="companyLogo"
              value={formData.companyLogo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        {/* Salary */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-white/10 pb-2">
            Compensation
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Salary Min (Annual)</label>
              <Input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                placeholder="e.g. 80000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Salary Max (Annual)</label>
              <Input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                placeholder="e.g. 120000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                name="salaryCurrency"
                value={formData.salaryCurrency}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-white/10 pb-2">
            Job Details
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports HTML formatting
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Requirements</label>
            <Textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List the required qualifications, skills, and experience..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Benefits</label>
            <Textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="List the benefits and perks..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. python, genomics, machine-learning, bioinformatics"
            />
          </div>
        </div>

        {/* Application */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-white/10 pb-2">
            Application
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Application URL</label>
              <Input
                name="applicationUrl"
                value={formData.applicationUrl}
                onChange={handleChange}
                placeholder="https://company.com/careers/job-123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Application Email</label>
              <Input
                type="email"
                name="applicationEmail"
                value={formData.applicationEmail}
                onChange={handleChange}
                placeholder="jobs@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expires At</label>
            <Input
              type="date"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-white/10 pb-2">
            Settings
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Featured Job</p>
              <p className="text-sm text-muted-foreground">
                Featured jobs appear at the top of the listing
              </p>
            </div>
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, featured: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Published</p>
              <p className="text-sm text-muted-foreground">
                Make this job visible on the public job board
              </p>
            </div>
            <Switch
              checked={formData.published}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, published: checked }))
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
          <Link href="/admin/jobs">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Job
          </Button>
        </div>
      </form>
    </div>
  );
}
