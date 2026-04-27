import { QuestionRecord } from "../types";
import { AbstractQuestion } from "../domain/questions/AbstractQuestion";
import { MultipleChoiceQuestion } from "../domain/questions/MultipleChoiceQuestion";
import { ShortAnswerQuestion } from "../domain/questions/ShortAnswerQuestion";
import { TrueFalseQuestion } from "../domain/questions/TrueFalseQuestion";

export class QuestionFactory {
  public static create(questionRecord: QuestionRecord): AbstractQuestion {
    switch (questionRecord.type) {
      case "multiple-choice":
        return new MultipleChoiceQuestion(questionRecord);
      case "true-false":
        return new TrueFalseQuestion(questionRecord);
      case "short-answer":
        return new ShortAnswerQuestion(questionRecord);
      default:
        throw new Error(`Unsupported question type: ${(questionRecord as QuestionRecord).type}`);
    }
  }

  public static createMany(questionRecords: QuestionRecord[]): AbstractQuestion[] {
    return questionRecords.map((questionRecord) => QuestionFactory.create(questionRecord));
  }
}
