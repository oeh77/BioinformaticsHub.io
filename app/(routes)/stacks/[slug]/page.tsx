import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Globe, User, Calendar, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export const revalidate = 300; // 5 minutes

interface StackTool {
  tool: {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string | null;
    pricing: string | null;
    category: { name: string };
  };
  addedAt: Date;
}

async function getStack(slug: string) {
  const stack = await prisma.stack.findUnique({
    where: { slug },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      tools: {
        include: {
          tool: {
            include: { category: true },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!stack || !stack.isPublic) {
    return null;
  }

  return stack;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stack = await getStack(slug);

  if (!stack) {
    return { title: "Stack Not Found" };
  }

  return {
    title: `${stack.name} | BioinformaticsHub`,
    description:
      stack.description ||
      `A curated collection of ${stack.tools.length} bioinformatics tools by ${stack.user.name}`,
  };
}

export default async function StackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stack = await getStack(slug);

  if (!stack) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <PageHeader
        title={stack.name}
        subtitle={stack.description || "A curated collection of bioinformatics tools"}
      />


      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/directory">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Button>
        </Link>

        {/* Stack Info */}
        <div className="mb-8 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {stack.user.image ? (
                <Image
                  src={stack.user.image}
                  alt={stack.user.name || "User"}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Curated by</div>
                <div className="font-semibold">{stack.user.name || "Anonymous"}</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Public Stack
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(stack.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mb-4 text-lg font-semibold">
          {stack.tools.length} {stack.tools.length === 1 ? "Tool" : "Tools"} in this Stack
        </div>

        {stack.tools.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            This stack is empty.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stack.tools.map(({ tool, addedAt }) => (
              <Link
                key={tool.id}
                href={`/directory/tool/${tool.slug}`}
                className="group p-5 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  {tool.image ? (
                    <Image
                      src={tool.image}
                      alt={tool.name}
                      width={56}
                      height={56}
                      className="rounded-lg bg-background/50 p-1"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">🧬</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {tool.description}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {tool.category.name}
                      </span>
                      {tool.pricing && (
                        <span className="text-xs text-muted-foreground">
                          {tool.pricing}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
