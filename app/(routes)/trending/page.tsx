"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  Calendar, 
  ArrowUpRight,
  Star,
  Eye,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TrendingItem {
  id: string;
  contentId: string;
  rank: number;
  score: number;
  views: number;
  growth: number;
  content: {
    id: string;
    name?: string;
    title?: string;
    slug: string;
    description?: string;
    excerpt?: string;
    image?: string;
    thumbnail?: string;
    category?: { name: string; slug: string };
  };
}

export default function TrendingPage() {
  const [period, setPeriod] = useState("weekly");
  const [contentType, setContentType] = useState("tool");
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/analytics/trending?period=${period}&type=${contentType}&limit=20`
        );
        if (res.ok) {
          const data = await res.json();
          setTrending(data.trending || []);
        }
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, [period, contentType]);

  const getContentLink = (item: TrendingItem) => {
    if (contentType === "tool") {
      return `/directory/tool/${item.content.slug}`;
    } else if (contentType === "course") {
      return `/courses/${item.content.slug}`;
    } else if (contentType === "post") {
      return `/blog/${item.content.slug}`;
    }
    return "#";
  };

  const getContentTitle = (item: TrendingItem) => {
    return item.content.name || item.content.title || "Untitled";
  };

  const getContentDescription = (item: TrendingItem) => {
    return item.content.description || item.content.excerpt || "";
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Flame className="h-10 w-10 text-orange-500" />
          <h1 className="text-4xl font-bold">Trending Now</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover the most popular bioinformatics tools, courses, and articles 
          that the community is exploring right now.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        {/* Content Type Tabs */}
        <Tabs value={contentType} onValueChange={setContentType}>
          <TabsList>
            <TabsTrigger value="tool">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="course">
              <Star className="h-4 w-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="post">
              <Eye className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Period Filter */}
        <div className="flex gap-2">
          <Button
            variant={period === "daily" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("daily")}
          >
            <Clock className="h-4 w-4 mr-1" />
            Today
          </Button>
          <Button
            variant={period === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("weekly")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            This Week
          </Button>
          <Button
            variant={period === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("monthly")}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            This Month
          </Button>
        </div>
      </div>

      {/* Trending Grid */}
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
      ) : trending.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Trending Data Yet</h3>
            <p className="text-muted-foreground">
              Check back soon as we gather more analytics data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.map((item, index) => (
            <Link key={item.id} href={getContentLink(item)}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                        ${index === 0 ? "bg-yellow-500 text-yellow-950" : ""}
                        ${index === 1 ? "bg-gray-300 text-gray-700" : ""}
                        ${index === 2 ? "bg-amber-600 text-amber-950" : ""}
                        ${index > 2 ? "bg-primary/10 text-primary" : ""}
                      `}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {getContentTitle(item)}
                        </CardTitle>
                        {item.content.category && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {item.content.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {getContentDescription(item)}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {item.views?.toLocaleString() || 0} views
                      </span>
                      {item.growth > 0 && (
                        <span className="flex items-center gap-1 text-green-500">
                          <TrendingUp className="h-4 w-4" />
                          +{item.growth.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* View More */}
      {trending.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All {contentType === "tool" ? "Tools" : contentType === "course" ? "Courses" : "Articles"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
