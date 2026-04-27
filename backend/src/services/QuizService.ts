import { HttpError } from "../errors/HttpError";
import { QuestionFactory } from "../factories/QuestionFactory";
import { readStore } from "../persistence/store";
import { createGradingStrategy } from "../strategies/createGradingStrategy";
import { QuizAttemptRecord } from "../types";
import { ProgressService } from "./ProgressService";

interface SubmitQuizInput {
  studentId: string;
  courseId: string;
  quizId: string;
  answers: Record<string, unknown>;
}

export class QuizService {
  private readonly progressService: ProgressService;

  constructor(progressService: ProgressService) {
    this.progressService = progressService;
  }

  public async submitQuiz(input: SubmitQuizInput): Promise<{
    quizId: string;
    summary: ReturnType<ReturnType<typeof createGradingStrategy>["summarize"]>;
    questionResults: ReturnType<ReturnType<typeof QuestionFactory.create>["grade"]>[];
    progress: Awaited<ReturnType<ProgressService["getSummary"]>>;
  }> {
    const { studentId, courseId, quizId, answers } = input;
    if (!studentId || !courseId || !quizId) {
      throw new HttpError(400, "studentId, courseId, and quizId are required.");
    }

    const store = await readStore();
    const course = store.courses.find((item) => item.id === courseId);

    if (!course) {
      throw new HttpError(404, "Course not found.");
    }

    if (course.quiz.id !== quizId) {
      throw new HttpError(404, "Quiz not found for this course.");
    }

    const questions = QuestionFactory.createMany(course.quiz.questions);
    const questionResults = questions.map((question) => {
      const answer = answers[question.id];
      return question.grade(answer);
    });

    const gradingStrategy = createGradingStrategy(course.quiz.gradingStrategy);
    const summary = gradingStrategy.summarize(questionResults, {
      passThreshold: course.quiz.passThreshold,
    });

    const quizAttempt: QuizAttemptRecord = {
      quizId,
      strategy: summary.strategy,
      score: summary.score,
      maxScore: summary.maxScore,
      percentage: summary.percentage,
      passed: summary.passed,
      attemptedAt: new Date().toISOString(),
    };

    const progress = await this.progressService.recordQuizAttempt(studentId, courseId, quizAttempt);

    return {
      quizId,
      summary,
      questionResults,
      progress,
    };
  }
}
