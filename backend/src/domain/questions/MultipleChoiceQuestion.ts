import { MultipleChoiceQuestionRecord } from "../../types";
import { AbstractQuestion } from "./AbstractQuestion";

export class MultipleChoiceQuestion extends AbstractQuestion<MultipleChoiceQuestionRecord> {
  public constructor(record: MultipleChoiceQuestionRecord) {
    super(record);
  }

  protected normalizeAnswer(rawAnswer: unknown): unknown {
    return String(rawAnswer ?? "").trim().toLowerCase();
  }

  protected evaluateAnswer(normalizedAnswer: unknown): boolean {
    const submitted = typeof normalizedAnswer === "string" ? normalizedAnswer : "";
    return submitted === this.record.correctOption.trim().toLowerCase();
  }

  public toClientShape(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      prompt: this.prompt,
      choices: this.record.choices,
      weight: this.record.weight ?? 1,
    };
  }
}
