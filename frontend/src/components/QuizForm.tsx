import { useMemo, useState } from "react";
import { QuizQuestion } from "../types";

interface QuizFormProps {
  quizId: string;
  questions: QuizQuestion[];
  disabled: boolean;
  submitting: boolean;
  onSubmit: (answers: Record<string, unknown>) => Promise<void>;
}

export function QuizForm({
  quizId,
  questions,
  disabled,
  submitting,
  onSubmit,
}: QuizFormProps): JSX.Element {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const allAnswered = useMemo(
    () => questions.every((question) => answers[question.id] !== undefined && answers[question.id] !== ""),
    [answers, questions],
  );

  const submitDisabled = disabled || !allAnswered || submitting;

  const setAnswer = (questionId: string, value: unknown): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <form
      className="quiz-form"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(answers);
      }}
    >
      <h3>{quizId}</h3>
      {questions.map((question) => (
        <fieldset className="question" key={question.id}>
          <legend>
            {question.prompt} <span className="weight">(weight {question.weight})</span>
          </legend>

          {question.type === "multiple-choice" && question.choices ? (
            <div className="options">
              {question.choices.map((choice) => (
                <label key={choice}>
                  <input
                    checked={answers[question.id] === choice}
                    name={question.id}
                    onChange={() => setAnswer(question.id, choice)}
                    type="radio"
                    value={choice}
                  />
                  {choice}
                </label>
              ))}
            </div>
          ) : null}

          {question.type === "true-false" ? (
            <div className="options">
              <label>
                <input
                  checked={answers[question.id] === true}
                  name={question.id}
                  onChange={() => setAnswer(question.id, true)}
                  type="radio"
                />
                True
              </label>
              <label>
                <input
                  checked={answers[question.id] === false}
                  name={question.id}
                  onChange={() => setAnswer(question.id, false)}
                  type="radio"
                />
                False
              </label>
            </div>
          ) : null}

          {question.type === "short-answer" ? (
            <input
              className="short-answer"
              onChange={(event) => setAnswer(question.id, event.target.value)}
              placeholder="Type your answer"
              type="text"
              value={typeof answers[question.id] === "string" ? String(answers[question.id]) : ""}
            />
          ) : null}
        </fieldset>
      ))}

      <button className="primary" disabled={submitDisabled} type="submit">
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </form>
  );
}
