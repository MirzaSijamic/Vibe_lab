import {
  CourseView,
  EnrollmentResult,
  ProgressSummary,
  QuizSubmitResult,
  TeacherMetric,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    throw new ApiError(response.status, String(body.message ?? "Request failed."));
  }

  return body as T;
}

export async function fetchCourses(studentId?: string): Promise<CourseView[]> {
  const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : "";
  const response = await requestJson<{ courses: CourseView[] }>(`/courses${query}`);
  return response.courses;
}

export async function enroll(studentName: string, courseId: string): Promise<EnrollmentResult> {
  return requestJson<EnrollmentResult>("/enrollments", {
    method: "POST",
    body: JSON.stringify({ studentName, courseId }),
  });
}

export async function completeLesson(
  lessonId: string,
  studentId: string,
  courseId: string,
): Promise<ProgressSummary> {
  const response = await requestJson<{ progress: ProgressSummary }>(`/lessons/${lessonId}/complete`, {
    method: "POST",
    body: JSON.stringify({ studentId, courseId }),
  });

  return response.progress;
}

export async function submitQuiz(
  quizId: string,
  payload: { studentId: string; courseId: string; answers: Record<string, unknown> },
): Promise<QuizSubmitResult> {
  return requestJson<QuizSubmitResult>(`/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchProgress(studentId: string, courseId: string): Promise<ProgressSummary> {
  const response = await requestJson<{ progress: ProgressSummary }>(
    `/students/${studentId}/progress?courseId=${encodeURIComponent(courseId)}`,
  );

  return response.progress;
}

export async function fetchTeacherMetrics(): Promise<TeacherMetric[]> {
  const response = await requestJson<{ metrics: TeacherMetric[] }>("/teacher/overview");
  return response.metrics;
}

export { ApiError };
