import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export async function LearningPaths() {
  // Fetch featured courses from database
  const courses = await prisma.course.findMany({
    where: { published: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  const levelIcons = {
    BEGINNER: BookOpen,
    INTERMEDIATE: GraduationCap,
    ADVANCED: Award,
  };

  const levelColors = {
    BEGINNER: 'bg-green-500/10 text-green-600 border-green-500/20',
    INTERMEDIATE: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    ADVANCED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  };

  return (
    <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Learning Paths</h2>
          <p className="text-muted-foreground">Start your bioinformatics journey with expert-curated courses.</p>
        </div>
        <Link href="/courses" className="text-primary hover:underline flex items-center text-sm font-medium">
            View all courses <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => {
          const lKey = course.level?.toUpperCase() as keyof typeof levelIcons;
          const LevelIcon = levelIcons[lKey] || BookOpen;
          const levelColorClass = levelColors[lKey] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';

          return (
            <div key={course.id} className="glass-card p-6 flex flex-col hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${levelColorClass} flex items-center gap-1`}>
                  <LevelIcon className="w-3 h-3" />
                  {course.level}
                </div>
              </div>

              <h3 className="font-semibold text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2">
                <Link href={`/courses/${course.slug}`}>{course.title}</Link>
              </h3>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                {course.description}
              </p>

              {course.provider && (
                <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {course.provider[0]}
                  </div>
                  <span>{course.provider}</span>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-auto glass hover:bg-primary hover:text-white group-hover:shadow-lg" 
                asChild
              >
                <Link href={`/courses/${course.slug}`}>
                  Explore Course
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
