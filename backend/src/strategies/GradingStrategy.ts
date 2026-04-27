import { QuestionGradeResult, QuizGradeSummary } from "../types";

export interface GradingContext {
  passThreshold?: number;
}

export interface GradingStrategy {
  readonly name: string;
  summarize(results: QuestionGradeResult[], context?: GradingContext): QuizGradeSummary;
}
