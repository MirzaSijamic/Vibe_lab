import { TrueFalseQuestionRecord } from "../../types";
import { AbstractQuestion } from "./AbstractQuestion";

export class TrueFalseQuestion extends AbstractQuestion<TrueFalseQuestionRecord> {
  public constructor(record: TrueFalseQuestionRecord) {
    super(record);
  }

  protected normalizeAnswer(rawAnswer: unknown): unknown {
    if (typeof rawAnswer === "boolean") {
      return rawAnswer;
    }

    const value = String(rawAnswer ?? "").trim().toLowerCase();
    return value === "true";
  }

  protected evaluateAnswer(normalizedAnswer: unknown): boolean {
    return Boolean(normalizedAnswer) === this.record.correct;
  }

  public toClientShape(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      prompt: this.prompt,
      weight: this.record.weight ?? 1,
    };
  }
}
