import { HttpError } from "../errors/HttpError";
import { ProgressEventType, ProgressSubject } from "../observers/ProgressObserver";
import { readStore, withStore } from "../persistence/store";
import {
  CourseRecord,
  ProgressRecord,
  ProgressSummary,
  QuizAttemptRecord,
  StoreData,
} from "../types";
import { NotificationCenter } from "./NotificationCenter";

export class ProgressService {
  private readonly progressSubject: ProgressSubject;
  private readonly notificationCenter: NotificationCenter;

  constructor(progressSubject: ProgressSubject, notificationCenter: NotificationCenter) {
    this.progressSubject = progressSubject;
    this.notificationCenter = notificationCenter;
  }

  public async initializeProgress(studentId: string, courseId: string): Promise<ProgressSummary> {
    const timestamp = new Date().toISOString();

    await withStore((store) => {
      this.assertCourseExists(store, courseId);
      this.getOrCreateProgressRecord(store, studentId, courseId, timestamp);
    });

    this.notify(studentId, courseId, "enrolled", "Enrollment completed.", 0, timestamp);
    return this.getSummary(studentId, courseId);
  }

  public async markLessonComplete(
    studentId: string,
    courseId: string,
    lessonId: string,
  ): Promise<ProgressSummary> {
    const timestamp = new Date().toISOString();
    let progressPercent = 0;

    await withStore((store) => {
      const courseRecord = this.assertCourseExists(store, courseId);
      const allLessonIds = this.getLessonIds(courseRecord);

      if (!allLessonIds.includes(lessonId)) {
        throw new HttpError(400, "Lesson does not belong to this course.");
      }

      const progressRecord = this.getOrCreateProgressRecord(store, studentId, courseId, timestamp);
      if (!progressRecord.completedLessonIds.includes(lessonId)) {
        progressRecord.completedLessonIds.push(lessonId);
      }

      progressRecord.updatedAt = timestamp;
      progressPercent = this.getProgressPercent(progressRecord, allLessonIds.length);
    });

    this.notify(
      studentId,
      courseId,
      "lesson-completed",
      `Lesson ${lessonId} marked complete.",
      progressPercent,
      timestamp,
    );

    return this.getSummary(studentId, courseId);
  }

  public async recordQuizAttempt(
    studentId: string,
    courseId: string,
    quizAttempt: QuizAttemptRecord,
  ): Promise<ProgressSummary> {
    const timestamp = new Date().toISOString();
    let progressPercent = 0;

    await withStore((store) => {
      const courseRecord = this.assertCourseExists(store, courseId);
      const totalLessons = this.getLessonIds(courseRecord).length;

      const progressRecord = this.getOrCreateProgressRecord(store, studentId, courseId, timestamp);
      progressRecord.quizAttempts.push(quizAttempt);
      progressRecord.updatedAt = timestamp;
      progressPercent = this.getProgressPercent(progressRecord, totalLessons);
    });

    this.notify(
      studentId,
      courseId,
      "quiz-submitted",
      `Quiz ${quizAttempt.quizId} submitted with ${quizAttempt.percentage}%.",
      progressPercent,
      timestamp,
    );

    return this.getSummary(studentId, courseId);
  }

  public async getSummary(studentId: string, courseId: string): Promise<ProgressSummary> {
    const store = await readStore();
    const courseRecord = this.assertCourseExists(store, courseId);
    const totalLessons = this.getLessonIds(courseRecord).length;

    const progressRecord =
      store.progress.find(
        (record) => record.studentId === studentId && record.courseId === courseId,
      ) ?? this.getEmptyProgress(studentId, courseId);

    return {
      studentId,
      courseId,
      completedLessons: progressRecord.completedLessonIds.length,
      totalLessons,
      progressPercent: this.getProgressPercent(progressRecord, totalLessons),
      latestQuizAttempt:
        progressRecord.quizAttempts.length > 0
          ? progressRecord.quizAttempts[progressRecord.quizAttempts.length - 1]
          : null,
      notifications: this.notificationCenter.getMessages(studentId),
      updatedAt: progressRecord.updatedAt,
    };
  }

  private notify(
    studentId: string,
    courseId: string,
    type: ProgressEventType,
    message: string,
    progressPercent: number,
    timestamp: string,
  ): void {
    this.progressSubject.notify({
      studentId,
      courseId,
      type,
      message,
      progressPercent,
      timestamp,
    });
  }

  private assertCourseExists(store: StoreData, courseId: string): CourseRecord {
    const courseRecord = store.courses.find((course) => course.id === courseId);
    if (!courseRecord) {
      throw new HttpError(404, "Course not found.");
    }

    return courseRecord;
  }

  private getOrCreateProgressRecord(
    store: StoreData,
    studentId: string,
    courseId: string,
    timestamp: string,
  ): ProgressRecord {
    const existing = store.progress.find(
      (record) => record.studentId === studentId && record.courseId === courseId,
    );

    if (existing) {
      return existing;
    }

    const created: ProgressRecord = {
      studentId,
      courseId,
      completedLessonIds: [],
      quizAttempts: [],
      updatedAt: timestamp,
    };

    store.progress.push(created);
    return created;
  }

  private getLessonIds(courseRecord: CourseRecord): string[] {
    return courseRecord.modules.flatMap((moduleRecord) =>
      moduleRecord.lessons.map((lessonRecord) => lessonRecord.id),
    );
  }

  private getProgressPercent(progressRecord: ProgressRecord, totalLessons: number): number {
    if (totalLessons === 0) {
      return 0;
    }

    const cappedCompleted = Math.min(progressRecord.completedLessonIds.length, totalLessons);
    return Math.round((cappedCompleted / totalLessons) * 100);
  }

  private getEmptyProgress(studentId: string, courseId: string): ProgressRecord {
    return {
      studentId,
      courseId,
      completedLessonIds: [],
      quizAttempts: [],
      updatedAt: new Date(0).toISOString(),
    };
  }
}
