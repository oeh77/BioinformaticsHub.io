"use client";

import { useState, useEffect } from "react";
import { 
  GitBranch, 
  Star, 
  Eye, 
  GitFork,
  Trash2,
  MoreVertical,
  Search,
  Globe,
  Lock,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkflowExportDialog } from "@/components/workflow/WorkflowExportDialog";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Workflow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  author: { id: string; name: string | null; email: string | null };
  isPublic: boolean;
  isFeatured: boolean;
  views: number;
  forks: number;
  createdAt: string;
}

export default function AdminWorkflowsPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchWorkflows();
  }, [filter]);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter === "featured") params.set("featured", "true");
      
      const res = await fetch(`/api/workflows?${params}`);
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

  const handleToggleFeatured = async (workflowSlug: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/workflows/${workflowSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentValue }),
      });

      if (res.ok) {
        toast({
          title: "Updated",
          description: `Workflow ${!currentValue ? "featured" : "unfeatured"}`,
        });
        fetchWorkflows();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (workflowSlug: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/workflows/${workflowSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !currentValue }),
      });

      if (res.ok) {
        toast({
          title: "Updated",
          description: `Workflow is now ${!currentValue ? "public" : "private"}`,
        });
        fetchWorkflows();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (workflowSlug: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      const res = await fetch(`/api/workflows/${workflowSlug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Deleted",
          description: "Workflow deleted successfully",
        });
        fetchWorkflows();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    }
  };

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: workflows.length,
    public: workflows.filter(w => w.isPublic).length,
    featured: workflows.filter(w => w.isFeatured).length,
    totalViews: workflows.reduce((acc, w) => acc + w.views, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="h-6 w-6" />
          Workflow Management
        </h1>
        <p className="text-muted-foreground">
          Manage user-created workflows and featured pipelines
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Workflows</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Public</CardDescription>
            <CardTitle className="text-2xl text-green-500">{stats.public}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Featured</CardDescription>
            <CardTitle className="text-2xl text-yellow-500">{stats.featured}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-2xl">{stats.totalViews}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Workflow</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-center">Stats</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No workflows found
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {workflow.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {workflow.description || "No description"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(workflow.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{workflow.author.name || workflow.author.email || "Anonymous"}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {workflow.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          {workflow.forks}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {workflow.isPublic ? (
                          <Badge variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <WorkflowExportDialog
                          workflowSlug={workflow.slug}
                          workflowName={workflow.name}
                          trigger={
                            <Button variant="ghost" size="icon" title="Export">
                              <Download className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/workflows/${workflow.slug}`, "_blank")}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(workflow.slug, workflow.isFeatured)}>
                              <Star className="h-4 w-4 mr-2" />
                              {workflow.isFeatured ? "Unfeature" : "Feature"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleVisibility(workflow.slug, workflow.isPublic)}>
                              {workflow.isPublic ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Make Private
                                </>
                              ) : (
                                <>
                                  <Globe className="h-4 w-4 mr-2" />
                                  Make Public
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(workflow.slug)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
