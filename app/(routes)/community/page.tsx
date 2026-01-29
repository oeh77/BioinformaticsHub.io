"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MessageCircleQuestion, 
  Plus, 
  Check, 
  ArrowUp,
  MessageSquare,
  Eye,
  Filter,
  Search,
  Tag
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

interface Question {
  id: string;
  slug: string;
  title: string;
  body: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    reputation: number;
  };
  views: number;
  upvotes: number;
  downvotes: number;
  isAnswered: boolean;
  isPinned: boolean;
  tags: Array<{
    tag: { id: string; name: string; slug: string; color: string };
  }>;
  _count: { answers: number };
  createdAt: string;
}

export default function CommunityPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "20",
          sort,
        });
        if (filter === "unanswered") {
          params.set("answered", "false");
        } else if (filter === "answered") {
          params.set("answered", "true");
        }
        
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

    fetchQuestions();
  }, [sort, filter]);

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const QuestionCard = ({ question }: { question: Question }) => (
    <Link href={`/community/${question.slug}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Stats Column */}
            <div className="hidden sm:flex flex-col items-center gap-2 text-center min-w-[80px]">
              <div className={`
                px-3 py-2 rounded-lg
                ${question.isAnswered ? "bg-green-500/10 text-green-600" : "bg-muted"}
              `}>
                <div className="text-lg font-bold flex items-center gap-1">
                  {question.upvotes}
                  <ArrowUp className="h-4 w-4" />
                </div>
                <div className="text-xs text-muted-foreground">votes</div>
              </div>
              <div className={`
                px-3 py-2 rounded-lg
                ${question.isAnswered ? "bg-green-500 text-white" : "bg-muted"}
              `}>
                <div className="text-lg font-bold flex items-center gap-1">
                  {question._count.answers}
                  {question.isAnswered && <Check className="h-4 w-4" />}
                </div>
                <div className="text-xs">
                  {question.isAnswered ? "accepted" : "answers"}
                </div>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {question.views}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                {question.isPinned && (
                  <Badge variant="secondary" className="shrink-0">📌 Pinned</Badge>
                )}
                <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                  {question.title}
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">
                {question.body.replace(/<[^>]*>/g, "").substring(0, 200)}...
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {question.tags.map(({ tag }) => (
                  <Badge 
                    key={tag.id} 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* Author and Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={question.author.image || ""} />
                    <AvatarFallback className="text-xs">
                      {question.author.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {question.author.name || "Anonymous"}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {question.author.reputation} rep
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Mobile Stats */}
              <div className="flex items-center gap-4 mt-3 sm:hidden text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  {question.upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {question._count.answers}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {question.views}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <MessageCircleQuestion className="h-10 w-10 text-primary" />
            Community Q&A
          </h1>
          <p className="text-muted-foreground mt-2">
            Ask questions, share knowledge, and help fellow bioinformaticians
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/community/ask">
            <Plus className="h-5 w-5 mr-2" />
            Ask Question
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="relative flex-1">
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

        <Tabs value={sort} onValueChange={setSort}>
          <TabsList>
            <TabsTrigger value="newest">Newest</TabsTrigger>
            <TabsTrigger value="votes">Top Voted</TabsTrigger>
            <TabsTrigger value="popular">Most Viewed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <MessageCircleQuestion className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Questions Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to ask a question and start the conversation!
            </p>
            <Button asChild>
              <Link href="/community/ask">
                <Plus className="h-4 w-4 mr-2" />
                Ask the First Question
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
