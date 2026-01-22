import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { BookOpen, Clock, GraduationCap, Code2, Dna, Database, Terminal, CheckCircle2, Award, Zap } from "lucide-react";
import { getCategoryImage } from "@/lib/utils";
import { FilterBar } from "@/components/filter-bar";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Learning steps for the "How it works" section
const searchSteps = [
  {
    title: "Choose Your Path",
    description: "Select a track that matches your career goals: Genomics, Proteomics, or Data Science.",
    icon: Dna,
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    title: "Master the Tools",
    description: "Learn industry-standard tools like BLAST, GATK, Nextflow, and R/Bioconductor.",
    icon: Terminal,
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    title: "Build Portfolio",
    description: "Complete hands-on projects to demonstrate your skills to future employers.",
    icon: Code2,
    color: "bg-green-500/10 text-green-500"
  },
  {
    title: "Get Certified",
    description: "Earn certificates to validate your expertise in specific bioinformatics domains.",
    icon: Award,
    color: "bg-orange-500/10 text-orange-500"
  }
];

export default async function CoursesPage({ searchParams }: Props) {
  const params = await Promise.resolve(searchParams);
  
  const category = typeof params.category === "string" ? params.category : "";
  const level = typeof params.level === "string" ? params.level : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const search = typeof params.q === "string" ? params.q : "";

  // Build query filters
  const where: Prisma.CourseWhereInput = {
    published: true,
    ...(category && { category: { slug: category } }),
    ...(level && { level }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        { provider: { contains: search } },
      ],
    }),
  };

  // Build order by
  let orderBy: Prisma.CourseOrderByWithRelationInput = { createdAt: "desc" };
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "name-asc":
      orderBy = { title: "asc" };
      break;
    case "name-desc":
      orderBy = { title: "desc" };
      break;
  }

  const courses = await prisma.course.findMany({
    where,
    include: { category: true },
    orderBy,
  });

  const categories = await prisma.category.findMany({
    where: { 
      type: 'TOOL',
      courses: { some: { published: true } }
    },
    orderBy: { name: "asc" },
  });

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Title (A-Z)" },
    { value: "name-desc", label: "Title (Z-A)" },
  ];
  
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Bioinformatics Courses"
        subtitle="Learn from the best. Curated courses for all skill levels."
        backgroundImage={getCategoryImage('courses')}
      />

      {/* Intro Section */}
      <section className="py-16 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Accelerate Your Career
              </span>
              <h2 className="text-4xl font-bold mb-6">
                Master Computational Biology
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Bioinformatics is a rapidly evolving field requiring a unique blend of 
                biology, computer science, and statistics. Our curated courses cover 
                everything from Python for biologists to advanced single-cell analysis 
                pipelines. Start your learning journey today.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Expert Instructors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Hands-on Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Real-world Data</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 text-center transform translate-y-8">
                  <div className="text-4xl font-bold text-primary mb-1">50+</div>
                  <div className="text-sm">Curated Courses</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-1">10k+</div>
                  <div className="text-sm">Students Learning</div>
                </div>
                <div className="glass-card p-6 text-center transform translate-y-8">
                  <div className="text-4xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-sm">Community Support</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Path Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/5">
            {searchSteps.map((step, idx) => (
              <div key={idx} className="glass-card p-6 hover:border-primary/50 transition-all group">
                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filter Bar */}
        <FilterBar 
          categories={categories}
          totalItems={courses.length}
          itemType="course"
          sortOptions={sortOptions}
          showPricing={false}
        />

        {/* Level Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link 
            href="/courses" 
            className={`px-4 py-2 rounded-full glass border font-medium transition-all ${
              !level ? 'border-primary bg-primary/10 text-primary' : 'border-white/20 hover:border-primary hover:bg-primary/5'
            }`}
          >
            All Levels
          </Link>
          {levels.map(lvl => (
            <Link 
              key={lvl}
              href={`/courses?level=${lvl}${category ? `&category=${category}` : ''}${sort !== 'newest' ? `&sort=${sort}` : ''}`}
              className={`px-4 py-2 rounded-full glass border font-medium transition-all ${
                level === lvl ? 'border-primary bg-primary/10 text-primary' : 'border-white/20 hover:border-primary hover:bg-primary/5'
              }`}
            >
              {lvl}
            </Link>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {courses.map((course) => (
            <Link 
              key={course.id} 
              href={`/courses/${course.slug}`}
              className="glass-card rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border border-white/10"
            >
              {/* Course Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                {course.image ? (
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <GraduationCap className="w-20 h-20 text-primary/40" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-black/90 text-foreground">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.provider}</span>
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-primary font-semibold">
                    {course.category.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Self-paced
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Courses Found</h3>
            <p className="text-muted-foreground">
              {search || category || level 
                ? "Try adjusting your filters or search terms."
                : "Check back soon for new courses!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
