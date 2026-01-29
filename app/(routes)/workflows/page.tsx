"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GitBranch, 
  Plus, 
  Star, 
  Eye, 
  GitFork,
  Search,
  Filter,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Workflow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  views: number;
  forks: number;
  isFeatured: boolean;
  tags: string;
  createdAt: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      try {
        const url = showFeatured 
          ? "/api/workflows?featured=true&limit=20"
          : "/api/workflows?limit=20";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setWorkflows(data.workflows || []);
        }
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, [showFeatured]);

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTags = (tagsJson: string): string[] => {
    try {
      return JSON.parse(tagsJson) || [];
    } catch {
      return [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <GitBranch className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Workflow Builder</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Design, share, and export bioinformatics pipelines. 
          Connect your favorite tools and generate workflow files for CWL, Nextflow, or Snakemake.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button asChild size="lg">
            <Link href="/workflows/new">
              <Plus className="h-5 w-5 mr-2" />
              Create Workflow
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/workflows/templates">
              <Sparkles className="h-5 w-5 mr-2" />
              Browse Templates
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={!showFeatured ? "default" : "outline"}
            onClick={() => setShowFeatured(false)}
          >
            All Workflows
          </Button>
          <Button
            variant={showFeatured ? "default" : "outline"}
            onClick={() => setShowFeatured(true)}
          >
            <Star className="h-4 w-4 mr-2" />
            Featured
          </Button>
        </div>
      </div>

      {/* Workflows Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <GitBranch className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Workflows Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to create and share a bioinformatics workflow!
            </p>
            <Button asChild>
              <Link href="/workflows/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Workflow
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <Link key={workflow.id} href={`/workflows/${workflow.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {workflow.name}
                        </CardTitle>
                        {workflow.isFeatured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {workflow.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {getTags(workflow.tags).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Author and Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={workflow.author.image || ""} />
                        <AvatarFallback className="text-xs">
                          {workflow.author.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {workflow.author.name || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {workflow.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        {workflow.forks}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Created {formatDistanceToNow(new Date(workflow.createdAt), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
