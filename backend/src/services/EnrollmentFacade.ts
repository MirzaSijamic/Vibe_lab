import { HttpError } from "../errors/HttpError";
import { readStore, withStore } from "../persistence/store";
import { EnrollmentRecord, StudentRecord } from "../types";
import { createId } from "../utils/id";
import { ProgressService } from "./ProgressService";

interface EnrollmentResult {
  student: StudentRecord;
  enrollment: EnrollmentRecord;
  alreadyEnrolled: boolean;
  progress: Awaited<ReturnType<ProgressService["getSummary"]>>;
}

class PaymentService {
  public process(_studentId: string, _courseId: string): void {
    // This mini app uses a free course, but the step remains in the facade pipeline.
  }
}

class WelcomeEmailService {
  public send(_studentName: string, _courseId: string): void {
    // Side effect placeholder for welcome notifications.
  }
}

class CalendarSyncService {
  public sync(_studentId: string, _courseId: string): void {
    // Side effect placeholder for calendar enrollment.
  }
}

export class EnrollmentFacade {
  private readonly paymentService = new PaymentService();
  private readonly welcomeEmailService = new WelcomeEmailService();
  private readonly calendarSyncService = new CalendarSyncService();
  private readonly progressService: ProgressService;

  constructor(progressService: ProgressService) {
    this.progressService = progressService;
  }

  public async enroll(studentName: string, courseId: string): Promise<EnrollmentResult> {
    const normalizedName = studentName.trim();
    if (!normalizedName) {
      throw new HttpError(400, "studentName is required.");
    }

    const enrollmentOutcome = await withStore((store) => {
      const course = store.courses.find((item) => item.id === courseId);
      if (!course) {
        throw new HttpError(404, "Course not found.");
      }

      let student = store.students.find(
        (item) => item.name.toLowerCase() === normalizedName.toLowerCase(),
      );

      if (!student) {
        student = {
          id: createId("student"),
          name: normalizedName,
          createdAt: new Date().toISOString(),
        };
        store.students.push(student);
      }

      let enrollment = store.enrollments.find(
        (item) => item.studentId === student!.id && item.courseId === courseId,
      );

      let alreadyEnrolled = false;
      if (enrollment) {
        alreadyEnrolled = true;
      } else {
        // Facade pipeline wraps all enrollment subsystems.
        this.paymentService.process(student.id, courseId);
        this.welcomeEmailService.send(student.name, courseId);
        this.calendarSyncService.sync(student.id, courseId);

        enrollment = {
          id: createId("enrollment"),
          studentId: student.id,
          courseId,
          enrolledAt: new Date().toISOString(),
          status: "active",
        };
        store.enrollments.push(enrollment);
      }

      return {
        student,
        enrollment,
        alreadyEnrolled,
      };
    });

    const progress = enrollmentOutcome.alreadyEnrolled
      ? await this.progressService.getSummary(enrollmentOutcome.student.id, courseId)
      : await this.progressService.initializeProgress(enrollmentOutcome.student.id, courseId);

    return {
      student: enrollmentOutcome.student,
      enrollment: enrollmentOutcome.enrollment,
      alreadyEnrolled: enrollmentOutcome.alreadyEnrolled,
      progress,
    };
  }

  public async getStudent(studentId: string): Promise<StudentRecord> {
    const store = await readStore();
    const student = store.students.find((item) => item.id === studentId);

    if (!student) {
      throw new HttpError(404, "Student not found.");
    }

    return student;
  }
}
