import { QuestionGradeResult, QuizGradeSummary } from "../types";
import { GradingContext, GradingStrategy } from "./GradingStrategy";

export class PercentageGradingStrategy implements GradingStrategy {
  public readonly name = "percentage";

  public summarize(results: QuestionGradeResult[], context?: GradingContext): QuizGradeSummary {
    const totalQuestions = results.length;
    const correctCount = results.filter((result) => result.isCorrect).length;
    const percentage =
      totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
    const passThreshold = context?.passThreshold ?? 70;

    return {
      strategy: this.name,
      correctCount,
      totalQuestions,
      score: correctCount,
      maxScore: totalQuestions,
      percentage,
      passed: percentage >= passThreshold,
    };
  }
}
