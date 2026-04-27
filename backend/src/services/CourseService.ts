import { buildCourseComposite } from "../domain/composite/buildCourseTree";
import { HttpError } from "../errors/HttpError";
import { QuestionFactory } from "../factories/QuestionFactory";
import { readStore } from "../persistence/store";
import { CourseRecord, CourseView, ProgressRecord } from "../types";

export class CourseService {
  public async listCourses(studentId?: string): Promise<CourseView[]> {
    const store = await readStore();

    return store.courses.map((courseRecord) =>
      this.toCourseView(courseRecord, store.progress, studentId),
    );
  }

  public async getCourse(courseId: string, studentId?: string): Promise<CourseView> {
    const store = await readStore();
    const courseRecord = store.courses.find((course) => course.id === courseId);

    if (!courseRecord) {
      throw new HttpError(404, "Course not found.");
    }

    return this.toCourseView(courseRecord, store.progress, studentId);
  }

  public async getCourseRecord(courseId: string): Promise<CourseRecord> {
    const store = await readStore();
    const courseRecord = store.courses.find((course) => course.id === courseId);

    if (!courseRecord) {
      throw new HttpError(404, "Course not found.");
    }

    return courseRecord;
  }

  public getLessonIds(courseRecord: CourseRecord): string[] {
    return courseRecord.modules.flatMap((moduleRecord) =>
      moduleRecord.lessons.map((lessonRecord) => lessonRecord.id),
    );
  }

  private toCourseView(
    courseRecord: CourseRecord,
    allProgressRecords: ProgressRecord[],
    studentId?: string,
  ): CourseView {
    const completedLessonIds = this.getCompletedLessonSet(
      allProgressRecords,
      studentId,
      courseRecord.id,
    );
    const courseComposite = buildCourseComposite(courseRecord);
    const quizQuestions = QuestionFactory.createMany(courseRecord.quiz.questions).map((question) =>
      question.toClientShape(),
    );

    return {
      id: courseRecord.id,
      title: courseRecord.title,
      tree: courseComposite.toTreeNode(completedLessonIds),
      quiz: {
        id: courseRecord.quiz.id,
        title: courseRecord.quiz.title,
        gradingStrategy: courseRecord.quiz.gradingStrategy,
        questionCount: courseRecord.quiz.questions.length,
        passThreshold: courseRecord.quiz.passThreshold,
        questions: quizQuestions,
      },
    };
  }

  private getCompletedLessonSet(
    allProgressRecords: ProgressRecord[],
    studentId: string | undefined,
    courseId: string,
  ): Set<string> {
    if (!studentId) {
      return new Set<string>();
    }

    const record = allProgressRecords.find(
      (progressRecord) =>
        progressRecord.studentId === studentId && progressRecord.courseId === courseId,
    );

    return new Set<string>(record?.completedLessonIds ?? []);
  }
}
