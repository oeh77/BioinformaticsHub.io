"use client";

import { useState, useEffect } from "react";
import { 
  MessageCircleQuestion, 
  Flag, 
  Check, 
  X, 
  Trash2,
  Eye,
  Pin,
  Lock,
  Search,
  Filter,
  MoreVertical,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  slug: string;
  title: string;
  author: { name: string | null; email: string | null };
  upvotes: number;
  downvotes: number;
  views: number;
  isAnswered: boolean;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
  _count: { answers: number };
}

interface Answer {
  id: string;
  body: string;
  author: { name: string | null; email: string | null };
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  createdAt: string;
  question: { title: string; slug: string };
}

export default function AdminCommunityPage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter === "unanswered") params.set("answered", "false");
      if (filter === "answered") params.set("answered", "true");
      
      const res = await fetch(`/api/questions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (questionSlug: string, action: string) => {
    try {
      const res = await fetch(`/api/questions/${questionSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [action]: true }),
      });

      if (res.ok) {
        toast({
          title: "Action completed",
          description: `Question ${action} successfully`,
        });
        fetchQuestions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (questionSlug: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`/api/questions/${questionSlug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Deleted",
          description: "Question deleted successfully",
        });
        fetchQuestions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: questions.length,
    unanswered: questions.filter(q => !q.isAnswered).length,
    flagged: 0, // Placeholder for flagged content
    closed: questions.filter(q => q.isClosed).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircleQuestion className="h-6 w-6" />
          Community Q&A Management
        </h1>
        <p className="text-muted-foreground">
          Moderate questions, answers, and manage community content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Questions</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unanswered</CardDescription>
            <CardTitle className="text-2xl text-orange-500">{stats.unanswered}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Flagged</CardDescription>
            <CardTitle className="text-2xl text-red-500">{stats.flagged}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Closed</CardDescription>
            <CardTitle className="text-2xl text-gray-500">{stats.closed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
            <TabsTrigger value="answered">Answered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Question</TableHead>
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
              ) : filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No questions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {question.isPinned && <Pin className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium line-clamp-1">{question.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{question.author.name || question.author.email || "Anonymous"}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-3 text-sm">
                        <span title="Votes">+{question.upvotes}</span>
                        <span title="Answers">{question._count.answers} A</span>
                        <span title="Views">{question.views} V</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {question.isAnswered && (
                          <Badge variant="default" className="bg-green-500">Answered</Badge>
                        )}
                        {question.isClosed && (
                          <Badge variant="secondary">Closed</Badge>
                        )}
                        {!question.isAnswered && !question.isClosed && (
                          <Badge variant="outline">Open</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/community/${question.slug}`, "_blank")}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(question.slug, "isPinned")}>
                            <Pin className="h-4 w-4 mr-2" />
                            {question.isPinned ? "Unpin" : "Pin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(question.slug, "isClosed")}>
                            <Lock className="h-4 w-4 mr-2" />
                            {question.isClosed ? "Reopen" : "Close"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(question.slug)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
