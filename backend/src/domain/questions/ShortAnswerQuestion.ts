import { ShortAnswerQuestionRecord } from "../../types";
import { AbstractQuestion } from "./AbstractQuestion";

export class ShortAnswerQuestion extends AbstractQuestion<ShortAnswerQuestionRecord> {
  protected normalizeAnswer(rawAnswer: unknown): unknown {
    return String(rawAnswer ?? "").trim().toLowerCase();
  }

  protected evaluateAnswer(normalizedAnswer: unknown): boolean {
    const submitted = typeof normalizedAnswer === "string" ? normalizedAnswer : "";
    return this.record.acceptableAnswers.some(
      (expected) => expected.trim().toLowerCase() === submitted,
    );
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
