import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  completeLesson,
  enroll,
  fetchCourses,
  fetchProgress,
  fetchTeacherMetrics,
  submitQuiz,
} from "./api";
import { CourseTree } from "./components/CourseTree";
import { ProgressPanel } from "./components/ProgressPanel";
import { QuizForm } from "./components/QuizForm";
import { CourseView, ProgressSummary, QuizSubmitResult, TeacherMetric } from "./types";

function toMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something unexpected happened.";
}

export default function App(): JSX.Element {
  const [courses, setCourses] = useState<CourseView[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [studentName, setStudentName] = useState<string>("");
  const [studentId, setStudentId] = useState<string | null>(null);

  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [quizResult, setQuizResult] = useState<QuizSubmitResult | null>(null);
  const [teacherMetrics, setTeacherMetrics] = useState<TeacherMetric[]>([]);

  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Ready");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const isEnrolled = Boolean(studentId && selectedCourse && progress?.courseId === selectedCourse.id);

  const loadCourses = async (activeStudentId?: string): Promise<void> => {
    setLoadingCourses(true);
    try {
      const fetchedCourses = await fetchCourses(activeStudentId);
      setCourses(fetchedCourses);
      if (!selectedCourseId && fetchedCourses.length > 0) {
        setSelectedCourseId(fetchedCourses[0].id);
      }
    } catch (error: unknown) {
      setErrorMessage(toMessage(error));
    } finally {
      setLoadingCourses(false);
    }
  };

  const refreshTeacherMetrics = async (): Promise<void> => {
    try {
      const metrics = await fetchTeacherMetrics();
      setTeacherMetrics(metrics);
    } catch {
      // Keep UI resilient if observer summary endpoint is unavailable.
    }
  };

  useEffect(() => {
    void loadCourses();
    void refreshTeacherMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId || !selectedCourse) {
      return;
    }

    const poll = async (): Promise<void> => {
      try {
        const summary = await fetchProgress(studentId, selectedCourse.id);
        setProgress(summary);
        await refreshTeacherMetrics();
      } catch {
        // Polling failures should not break the app experience.
      }
    };

    void poll();
    const timerId = window.setInterval(() => {
      void poll();
    }, 4000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [studentId, selectedCourse]);

  const handleEnroll = async (): Promise<void> => {
    if (!selectedCourse) {
      return;
    }

    setIsEnrolling(true);
    setErrorMessage("");
    try {
      const result = await enroll(studentName, selectedCourse.id);
      setStudentId(result.student.id);
      setProgress(result.progress);
      setStatus(
        result.alreadyEnrolled
          ? `Welcome back, ${result.student.name}.`
          : `Enrollment successful for ${result.student.name}.`,
      );
      await loadCourses(result.student.id);
      await refreshTeacherMetrics();
    } catch (error: unknown) {
      setErrorMessage(toMessage(error));
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCompleteLesson = async (lessonId: string): Promise<void> => {
    if (!studentId || !selectedCourse) {
      return;
    }

    setCompletingLessonId(lessonId);
    setErrorMessage("");
    try {
      const nextProgress = await completeLesson(lessonId, studentId, selectedCourse.id);
      setProgress(nextProgress);
      setStatus(`Lesson completed: ${lessonId}`);
      await loadCourses(studentId);
      await refreshTeacherMetrics();
    } catch (error: unknown) {
      setErrorMessage(toMessage(error));
    } finally {
      setCompletingLessonId(null);
    }
  };

  const handleSubmitQuiz = async (answers: Record<string, unknown>): Promise<void> => {
    if (!studentId || !selectedCourse) {
      return;
    }

    setIsSubmittingQuiz(true);
    setErrorMessage("");
    try {
      const result = await submitQuiz(selectedCourse.quiz.id, {
        studentId,
        courseId: selectedCourse.id,
        answers,
      });

      setQuizResult(result);
      setProgress(result.progress);
      setStatus(`Quiz submitted. Score: ${result.summary.percentage}%`);
      await refreshTeacherMetrics();
    } catch (error: unknown) {
      setErrorMessage(toMessage(error));
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Pattern-Driven LMS</p>
        <h1>Course Platform Mini App</h1>
        <p>
          Composite hierarchy, Factory question creation, Strategy grading, Observer events,
          and Facade enrollment are all active in this workflow.
        </p>
      </header>

      <section className="panel controls">
        <div>
          <label htmlFor="course-select">Course</label>
          <select
            id="course-select"
            onChange={(event) => setSelectedCourseId(event.target.value)}
            value={selectedCourseId}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="student-name">Student name</label>
          <input
            id="student-name"
            onChange={(event) => setStudentName(event.target.value)}
            placeholder="e.g. Amina"
            type="text"
            value={studentName}
          />
        </div>

        <button
          className="primary"
          disabled={!selectedCourse || !studentName.trim() || isEnrolling}
          onClick={() => void handleEnroll()}
          type="button"
        >
          {isEnrolling ? "Enrolling..." : "Enroll"}
        </button>

        <p className="status-text">{status}</p>
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      </section>

      <main className="content-grid">
        <section className="panel">
          <h2>Course Hierarchy</h2>
          {loadingCourses ? <p>Loading courses...</p> : null}
          {!loadingCourses && selectedCourse ? (
            <ul className="tree-root">
              <CourseTree
                completingLessonId={completingLessonId}
                enrolled={isEnrolled}
                node={selectedCourse.tree}
                onCompleteLesson={handleCompleteLesson}
              />
            </ul>
          ) : null}
        </section>

        <section className="panel">
          <h2>Quiz</h2>
          {selectedCourse ? (
            <>
              <p className="quiz-meta">
                {selectedCourse.quiz.title} · Strategy: {selectedCourse.quiz.gradingStrategy}
              </p>
              <QuizForm
                disabled={!isEnrolled}
                onSubmit={handleSubmitQuiz}
                questions={selectedCourse.quiz.questions}
                quizId={selectedCourse.quiz.id}
                submitting={isSubmittingQuiz}
              />
            </>
          ) : (
            <p>Select a course to begin.</p>
          )}

          {quizResult ? (
            <div className="quiz-result-box">
              <h3>Quiz Summary</h3>
              <p>
                Correct {quizResult.summary.correctCount}/{quizResult.summary.totalQuestions}
              </p>
              <p>
                Score {quizResult.summary.score}/{quizResult.summary.maxScore} (
                {quizResult.summary.percentage}%)
              </p>
              <p>{quizResult.summary.passed ? "Passed" : "Did not meet threshold"}</p>
            </div>
          ) : null}
        </section>

        <ProgressPanel progress={progress} teacherMetrics={teacherMetrics} />
      </main>
    </div>
  );
}
