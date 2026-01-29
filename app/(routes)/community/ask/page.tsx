"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  Send,
  Tag,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AskQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your question",
        variant: "destructive",
      });
      return;
    }

    if (!body.trim() || body.trim().length < 20) {
      toast({
        title: "Error",
        description: "Please provide more details (at least 20 characters)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          tags,
        }),
      });

      if (res.ok) {
        const question = await res.json();
        toast({
          title: "Question Posted",
          description: "Your question has been submitted successfully.",
        });
        router.push(`/community/${question.slug}`);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to post question");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/community">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ask a Question</h1>
          <p className="text-muted-foreground">
            Get help from the bioinformatics community
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                Question Title
              </Label>
              <Input
                id="title"
                placeholder="What's your bioinformatics question? Be specific."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Summarize your problem in a one-line title.
              </p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body" className="text-base">
                Details
              </Label>
              <Textarea
                id="body"
                placeholder="Describe your problem in detail. Include what you've tried, any error messages, and relevant code or data formats."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Include all the information someone would need to answer your question.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/20"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                placeholder="Add up to 5 tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={tags.length >= 5}
              />
              <p className="text-sm text-muted-foreground">
                Add tags like "blast", "rna-seq", "python" to help others find your question.
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Your Question"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/community">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>

        {/* Tips Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Writing a Good Question
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <strong>1. Summarize your problem</strong>
                <p className="text-muted-foreground">
                  Make your title specific and descriptive.
                </p>
              </div>
              <div>
                <strong>2. Describe what you've tried</strong>
                <p className="text-muted-foreground">
                  Show your research effort and previous attempts.
                </p>
              </div>
              <div>
                <strong>3. Include relevant details</strong>
                <p className="text-muted-foreground">
                  Error messages, tool versions, input formats.
                </p>
              </div>
              <div>
                <strong>4. Use proper formatting</strong>
                <p className="text-muted-foreground">
                  Code blocks, lists, and clear sections help.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {["blast", "rna-seq", "python", "biopython", "alignment", "ngs", "variant-calling", "galaxy"].map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
