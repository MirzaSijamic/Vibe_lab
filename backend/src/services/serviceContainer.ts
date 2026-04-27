import { teacherDashboardObserver } from "./ProgressEvents";
import { CourseService } from "./CourseService";
import { EnrollmentFacade } from "./EnrollmentFacade";
import { notificationCenter, progressSubject } from "./ProgressEvents";
import { ProgressService } from "./ProgressService";
import { QuizService } from "./QuizService";

export const courseService = new CourseService();
export const progressService = new ProgressService(progressSubject, notificationCenter);
export const enrollmentFacade = new EnrollmentFacade(progressService);
export const quizService = new QuizService(progressService);
export { notificationCenter, teacherDashboardObserver };
