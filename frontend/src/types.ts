export type QuestionType = "multiple-choice" | "true-false" | "short-answer";

export interface CourseTreeNode {
  id: string;
  title: string;
  kind: "course" | "module" | "lesson";
  durationMinutes: number;
  progressPercent: number;
  children: CourseTreeNode[];
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  weight: number;
  choices?: string[];
}

export interface CourseView {
  id: string;
  title: string;
  tree: CourseTreeNode;
  quiz: {
    id: string;
    title: string;
    gradingStrategy: "pass-fail" | "percentage" | "weighted";
    questionCount: number;
    passThreshold?: number;
    questions: QuizQuestion[];
  };
}

export interface ProgressSummary {
  studentId: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  latestQuizAttempt: {
    quizId: string;
    strategy: string;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    attemptedAt: string;
  } | null;
  notifications: string[];
  updatedAt: string;
}

export interface EnrollmentResult {
  student: {
    id: string;
    name: string;
    createdAt: string;
  };
  enrollment: {
    id: string;
    studentId: string;
    courseId: string;
    enrolledAt: string;
    status: "active";
  };
  alreadyEnrolled: boolean;
  progress: ProgressSummary;
}

export interface QuestionGradeResult {
  questionId: string;
  prompt: string;
  isCorrect: boolean;
  earnedScore: number;
  maxScore: number;
}

export interface QuizSubmitResult {
  quizId: string;
  summary: {
    strategy: string;
    correctCount: number;
    totalQuestions: number;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  };
  questionResults: QuestionGradeResult[];
  progress: ProgressSummary;
}

export interface TeacherMetric {
  key: string;
  count: number;
}
