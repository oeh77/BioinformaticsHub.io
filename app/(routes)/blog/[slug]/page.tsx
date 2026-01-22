import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, Facebook, Linkedin, Twitter, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="container max-w-4xl mx-auto px-4 py-12">
      <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
      </Link>

      <header className="mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
             <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{post.category.name}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
        
        <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><User className="w-4 h-4"/></div>
                By Admin
            </span>
            <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
        </div>
      </header>

      {/* Featured Image Placeholder */}
      <div className="relative w-full h-[400px] bg-secondary/30 rounded-2xl mb-12 overflow-hidden flex items-center justify-center text-muted-foreground">
         <span className="text-lg">Featured Image</span>
      </div>

      <div className="glass-card p-8 md:p-12 rounded-2xl">
        <div className="prose dark:prose-invert prose-lg max-w-none prose-a:text-primary prose-headings:font-bold prose-img:rounded-xl">
             <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>

      <div className="mt-12 flex justify-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full">
            <Twitter className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full">
            <Linkedin className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full">
            <Facebook className="w-4 h-4" />
        </Button>
      </div>
    </article>
  );
}
