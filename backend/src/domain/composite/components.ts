import { CourseComponent } from "./CourseComponent";

class CompositeCourseComponent extends CourseComponent {
  private readonly children: CourseComponent[];
  public readonly kind: "course" | "module";

  constructor(id: string, title: string, kind: "course" | "module", children: CourseComponent[]) {
    super(id, title);
    this.kind = kind;
    this.children = children;
  }

  public getDurationMinutes(): number {
    return this.children.reduce((total, child) => total + child.getDurationMinutes(), 0);
  }

  public getTotalLessons(): number {
    return this.children.reduce((total, child) => total + child.getTotalLessons(), 0);
  }

  public getCompletedLessons(completedLessonIds: Set<string>): number {
    return this.children.reduce(
      (total, child) => total + child.getCompletedLessons(completedLessonIds),
      0,
    );
  }

  public getChildren(): CourseComponent[] {
    return this.children;
  }
}

export class LessonComponent extends CourseComponent {
  public readonly kind = "lesson" as const;
  private readonly durationMinutes: number;

  constructor(id: string, title: string, durationMinutes: number) {
    super(id, title);
    this.durationMinutes = durationMinutes;
  }

  public getDurationMinutes(): number {
    return this.durationMinutes;
  }

  public getTotalLessons(): number {
    return 1;
  }

  public getCompletedLessons(completedLessonIds: Set<string>): number {
    return completedLessonIds.has(this.id) ? 1 : 0;
  }

  public getChildren(): CourseComponent[] {
    return [];
  }
}

export class ModuleComponent extends CompositeCourseComponent {
  constructor(id: string, title: string, children: CourseComponent[]) {
    super(id, title, "module", children);
  }
}

export class CourseRootComponent extends CompositeCourseComponent {
  constructor(id: string, title: string, children: CourseComponent[]) {
    super(id, title, "course", children);
  }
}
