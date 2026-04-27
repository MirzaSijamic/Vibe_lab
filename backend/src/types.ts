export type QuestionType = "multiple-choice" | "true-false" | "short-answer";
export type GradingStrategyType = "pass-fail" | "percentage" | "weighted";

export interface LessonRecord {
  id: string;
  title: string;
  durationMinutes: number;
}

export interface ModuleRecord {
  id: string;
  title: string;
  lessons: LessonRecord[];
}

export interface QuestionRecordBase {
  id: string;
  type: QuestionType;
  prompt: string;
  weight?: number;
}

export interface MultipleChoiceQuestionRecord extends QuestionRecordBase {
  type: "multiple-choice";
  choices: string[];
  correctOption: string;
}

export interface TrueFalseQuestionRecord extends QuestionRecordBase {
  type: "true-false";
  correct: boolean;
}

export interface ShortAnswerQuestionRecord extends QuestionRecordBase {
  type: "short-answer";
  acceptableAnswers: string[];
}

export type QuestionRecord =
  | MultipleChoiceQuestionRecord
  | TrueFalseQuestionRecord
  | ShortAnswerQuestionRecord;

export interface QuizRecord {
  id: string;
  title: string;
  gradingStrategy: GradingStrategyType;
  passThreshold?: number;
  questions: QuestionRecord[];
}

export interface CourseRecord {
  id: string;
  title: string;
  modules: ModuleRecord[];
  quiz: QuizRecord;
}

export interface StudentRecord {
  id: string;
  name: string;
  createdAt: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: "active";
}

export interface QuizAttemptRecord {
  quizId: string;
  strategy: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptedAt: string;
}

export interface ProgressRecord {
  studentId: string;
  courseId: string;
  completedLessonIds: string[];
  quizAttempts: QuizAttemptRecord[];
  updatedAt: string;
}

export interface StoreData {
  courses: CourseRecord[];
  students: StudentRecord[];
  enrollments: EnrollmentRecord[];
  progress: ProgressRecord[];
}

export interface CourseTreeNode {
  id: string;
  title: string;
  kind: "course" | "module" | "lesson";
  durationMinutes: number;
  progressPercent: number;
  children: CourseTreeNode[];
}

export interface CourseView {
  id: string;
  title: string;
  tree: CourseTreeNode;
  quiz: {
    id: string;
    title: string;
    gradingStrategy: GradingStrategyType;
    questionCount: number;
    passThreshold?: number;
  };
}

export interface QuestionGradeResult {
  questionId: string;
  prompt: string;
  isCorrect: boolean;
  earnedScore: number;
  maxScore: number;
}

export interface QuizGradeSummary {
  strategy: string;
  correctCount: number;
  totalQuestions: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
}

export interface ProgressSummary {
  studentId: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  latestQuizAttempt: QuizAttemptRecord | null;
  notifications: string[];
  updatedAt: string;
}
