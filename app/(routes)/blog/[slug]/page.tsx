import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { RelatedContent } from "@/components/content/related-content";
import { JsonLd } from "@/components/seo/json-ld";
import { generatePostMeta, toNextMetadata, generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo";

// ISR with 5m revalidation
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug, published: true },
    include: { 
      category: true,
    }
  });
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) {
    return { title: "Post Not Found" };
  }
  
  const seo = generatePostMeta(post);
  return toNextMetadata(seo);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Calculate reading time
  const wordCount = post.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.category.name, url: `/blog?category=${post.category.slug}` },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <JsonLd data={generateArticleSchema(post)} />
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />

      <article className="container max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {breadcrumbs.slice(0, -1).map((crumb, i) => (
              <li key={crumb.url} className="flex items-center gap-2">
                <Link href={crumb.url} className="hover:text-primary transition-colors">
                  {crumb.name}
                </Link>
                <span>/</span>
              </li>
            ))}
            <li className="text-foreground font-medium truncate max-w-[200px]">
              {post.title}
            </li>
          </ol>
        </nav>

        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Link>

        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {post.category.name}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
          
          <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm flex-wrap">
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4"/>
              </div>
              By Admin
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {post.image ? (
          <div className="relative w-full h-[400px] rounded-2xl mb-12 overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative w-full h-[400px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mb-12 overflow-hidden flex items-center justify-center">
            <div className="text-6xl font-bold text-primary/30">{post.title.charAt(0)}</div>
          </div>
        )}

        <div className="glass-card p-8 md:p-12 rounded-2xl">
          <div className="prose dark:prose-invert prose-lg max-w-none prose-a:text-primary prose-headings:font-bold prose-img:rounded-xl">
            <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <ShareButton 
            title={post.title}
            description={post.excerpt || undefined}
            showLabel={true}
          />
        </div>

        {/* Related Content */}
        <div className="mt-16 pt-12 border-t">
          <RelatedContent
            contentId={post.id}
            contentType="post"
            title={post.title}
            content={post.content || ""}
            limit={4}
            variant="cards"
          />
        </div>
      </article>
    </>
  );
}
