import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Clock, BarChart, Award, Users } from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import { getCategoryImage, getCategoryStyle } from "@/lib/utils";

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await Promise.resolve(params);

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!course) {
    notFound();
  }

  // Find related courses
  const relatedCourses = await prisma.course.findMany({
    where: { 
      categoryId: course.categoryId,
      id: { not: course.id },
      published: true
    },
    take: 3
  });

  const style = getCategoryStyle(course.category.slug);
  const bgImage = getCategoryImage(course.category.slug);

  return (
    <>
      <PageHeader 
        title={course.title}
        subtitle={`${course.level} course by ${course.provider}`}
        backgroundImage={bgImage}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-primary transition-colors">Courses</Link>
          <span className="opacity-50">/</span>
          <Link href={`/courses?category=${course.category.slug}`} className="hover:text-primary transition-colors">
            {course.category.name}
          </Link>
          <span className="opacity-50">/</span>
          <span className="text-foreground font-medium">{course.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className={`glass-card p-10 rounded-3xl border-t-4 ${style.border.replace('/20', '')} shadow-2xl`}>
              {/* Course Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
                    {course.category.name}
                  </span>
                  <span className="bg-secondary/50 backdrop-blur-md text-secondary-foreground border border-white/10 px-3 py-1 rounded-full text-xs font-semibold">
                    {course.level}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{course.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {course.provider}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Self-paced
                  </span>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">{course.description}</p>
              </div>

              {/* Course Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 glass rounded-2xl">
                <div className="text-center">
                  <BarChart className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">Skill Level</div>
                  <div className="text-sm text-muted-foreground">{course.level}</div>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">Students</div>
                  <div className="text-sm text-muted-foreground">10,000+</div>
                </div>
                <div className="text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">Certificate</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
              </div>

              {/* Enroll Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <BookmarkButton itemType="COURSE" itemId={course.id} />
                {course.url ? (
                  <Button 
                    size="lg" 
                    className={`flex-1 rounded-full shadow-lg ${style.glow} hover:shadow-xl transition-shadow`}
                    asChild
                  >
                    <Link href={course.url} target="_blank" className="flex items-center justify-center">
                      Enroll Now <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="flex-1 rounded-full"
                    disabled
                  >
                    Coming Soon
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="glass p-8 rounded-2xl space-y-6 shadow-lg">
              <h3 className="font-bold text-lg">Course Information</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{course.provider}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{course.category.name}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">Online</span>
                </div>
              </div>
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className="glass p-8 rounded-2xl shadow-lg">
                <h3 className="font-bold text-lg mb-6">Related Courses</h3>
                <div className="space-y-5">
                  {relatedCourses.map(related => (
                    <Link 
                      key={related.id} 
                      href={`/courses/${related.slug}`} 
                      className="flex items-start gap-4 group"
                    >
                      <div className={`w-12 h-12 rounded-lg ${style.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <BookOpen className={`w-6 h-6 ${style.text}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {related.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{related.provider}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
