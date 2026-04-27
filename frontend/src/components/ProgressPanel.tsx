import { ProgressSummary, TeacherMetric } from "../types";

interface ProgressPanelProps {
  progress: ProgressSummary | null;
  teacherMetrics: TeacherMetric[];
}

export function ProgressPanel({ progress, teacherMetrics }: ProgressPanelProps): JSX.Element {
  if (!progress) {
    return (
      <section className="panel">
        <h3>Progress Snapshot</h3>
        <p>Enroll in a course to start tracking progress and observer notifications.</p>
      </section>
    );
  }

  const latestQuiz = progress.latestQuizAttempt;

  return (
    <section className="panel progress-panel">
      <h3>Progress Snapshot</h3>
      <p>
        Lessons: <strong>{progress.completedLessons}</strong> / {progress.totalLessons}
      </p>
      <p>
        Progress: <strong>{progress.progressPercent}%</strong>
      </p>

      {latestQuiz ? (
        <div className="quiz-result-box">
          <h4>Latest Quiz Attempt</h4>
          <p>
            Score {latestQuiz.score}/{latestQuiz.maxScore} ({latestQuiz.percentage}%)
          </p>
          <p>Status: {latestQuiz.passed ? "Passed" : "Needs work"}</p>
        </div>
      ) : null}

      <div className="notifications">
        <h4>Observer Notifications</h4>
        {progress.notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul>
            {progress.notifications.slice(-6).reverse().map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="teacher-metrics">
        <h4>Teacher Dashboard Metrics</h4>
        {teacherMetrics.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          <ul>
            {teacherMetrics.map((metric) => (
              <li key={metric.key}>
                <span>{metric.key}</span>
                <strong>{metric.count}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
