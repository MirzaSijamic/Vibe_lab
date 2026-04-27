import { QuestionGradeResult, QuizGradeSummary } from "../types";
import { GradingContext, GradingStrategy } from "./GradingStrategy";

export class PassFailGradingStrategy implements GradingStrategy {
  public readonly name = "pass-fail";

  public summarize(results: QuestionGradeResult[], context?: GradingContext): QuizGradeSummary {
    const totalQuestions = results.length;
    const correctCount = results.filter((result) => result.isCorrect).length;
    const score = results.reduce((total, result) => total + result.earnedScore, 0);
    const maxScore = results.reduce((total, result) => total + result.maxScore, 0);
    const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
    const passThreshold = context?.passThreshold ?? 100;

    return {
      strategy: this.name,
      correctCount,
      totalQuestions,
      score,
      maxScore,
      percentage,
      passed: percentage >= passThreshold,
    };
  }
}
