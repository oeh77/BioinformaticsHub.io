"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, ExternalLink, Pencil } from "lucide-react";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";
import { BulkActions } from "@/components/admin/bulk-actions";

interface Course {
  id: string;
  title: string;
  slug: string;
  provider: string;
  level: string;
  published: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface CoursesTableProps {
  courses: Course[];
}

export function CoursesTable({ courses }: CoursesTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggle = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const selectAll = () => {
    setSelectedIds(courses.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const levelColors: Record<string, string> = {
    Beginner: "bg-green-500/10 text-green-500",
    Intermediate: "bg-yellow-500/10 text-yellow-500",
    Advanced: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <BulkActions
        selectedIds={selectedIds}
        totalItems={courses.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        deleteEndpoint="/api/admin/courses"
        itemName="course"
      />

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 w-12">
                  <Checkbox
                    checked={selectedIds.length === courses.length && courses.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                    aria-label="Select all courses"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Course</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Provider</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Level</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No courses found.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr
                    key={course.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      isSelected(course.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected(course.id)}
                        onCheckedChange={(checked) => toggle(course.id, checked)}
                        aria-label={`Select ${course.title}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 font-bold">
                          {course.title[0]}
                        </div>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{course.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{course.provider}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${levelColors[course.level] || "bg-secondary"}`}>
                        {course.level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm px-2 py-1 rounded-full bg-secondary/50">
                        {course.category.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${course.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/learn/${course.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View course">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit course">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteCourseButton courseId={course.id} courseName={course.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
