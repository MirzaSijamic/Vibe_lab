import { CourseTreeNode } from "../../types";

export abstract class CourseComponent {
  public readonly id: string;
  public readonly title: string;
  public abstract readonly kind: CourseTreeNode["kind"];

  protected constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
  }

  public abstract getDurationMinutes(): number;
  public abstract getTotalLessons(): number;
  public abstract getCompletedLessons(completedLessonIds: Set<string>): number;
  public abstract getChildren(): CourseComponent[];

  public getProgressPercent(completedLessonIds: Set<string>): number {
    const totalLessons = this.getTotalLessons();
    if (totalLessons === 0) {
      return 0;
    }

    const completedLessons = this.getCompletedLessons(completedLessonIds);
    return Math.round((completedLessons / totalLessons) * 100);
  }

  public toTreeNode(completedLessonIds: Set<string>): CourseTreeNode {
    return {
      id: this.id,
      title: this.title,
      kind: this.kind,
      durationMinutes: this.getDurationMinutes(),
      progressPercent: this.getProgressPercent(completedLessonIds),
      children: this.getChildren().map((child) => child.toTreeNode(completedLessonIds)),
    };
  }
}
