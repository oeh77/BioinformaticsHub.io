"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  Star,
  StarOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string | null;
  description: string;
  requirements: string | null;
  benefits: string | null;
  applicationUrl: string;
  companyLogo: string | null;
  featured: boolean;
  published: boolean;
  expiresAt: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFeatured(job: Job) {
    try {
      const response = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !job.featured }),
      });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  }

  async function togglePublished(job: Job) {
    try {
      const response = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !job.published }),
      });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Error toggling published:", error);
    }
  }

  async function deleteJob() {
    if (!jobToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/jobs/${jobToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDeleteDialogOpen(false);
        setJobToDelete(null);
        fetchJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  }

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Board Management</h1>
          <p className="text-muted-foreground mt-1">Manage job postings for the bioinformatics community</p>
        </div>
        <Link href="/admin/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </Link>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No jobs found</p>
            <Link href="/admin/jobs/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  {job.companyLogo ? (
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{job.title}</h3>
                      {job.featured && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          Featured
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          job.published
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {job.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.salary}
                        </span>
                      )}
                      <span className="capitalize">{job.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFeatured(job)}
                    title={job.featured ? "Remove featured" : "Mark as featured"}
                  >
                    {job.featured ? (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublished(job)}
                  >
                    {job.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Link href={`/jobs/${job.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" title="View job">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/jobs/${job.id}/edit`}>
                    <Button variant="ghost" size="icon" title="Edit job">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setJobToDelete(job);
                      setDeleteDialogOpen(true);
                    }}
                    title="Delete job"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{jobToDelete?.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteJob}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
