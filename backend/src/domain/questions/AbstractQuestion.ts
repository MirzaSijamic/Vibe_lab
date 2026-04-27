import { QuestionGradeResult, QuestionRecord } from "../../types";

export abstract class AbstractQuestion<TRecord extends QuestionRecord = QuestionRecord> {
  protected readonly record: TRecord;

  protected constructor(record: TRecord) {
    this.record = record;
  }

  public get id(): string {
    return this.record.id;
  }

  public get prompt(): string {
    return this.record.prompt;
  }

  public get type(): TRecord["type"] {
    return this.record.type;
  }

  protected getWeight(): number {
    return this.record.weight ?? 1;
  }

  // Template Method: normalize, evaluate, and build result in a fixed skeleton.
  public grade(rawAnswer: unknown): QuestionGradeResult {
    const normalizedAnswer = this.normalizeAnswer(rawAnswer);
    const isCorrect = this.evaluateAnswer(normalizedAnswer);
    const maxScore = this.getWeight();

    return {
      questionId: this.record.id,
      prompt: this.record.prompt,
      isCorrect,
      earnedScore: isCorrect ? maxScore : 0,
      maxScore,
    };
  }

  protected normalizeAnswer(rawAnswer: unknown): unknown {
    return rawAnswer;
  }

  protected abstract evaluateAnswer(normalizedAnswer: unknown): boolean;

  public abstract toClientShape(): Record<string, unknown>;
}
