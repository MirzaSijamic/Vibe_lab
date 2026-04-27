import { CourseTreeNode } from "../types";

interface CourseTreeProps {
  node: CourseTreeNode;
  enrolled: boolean;
  onCompleteLesson: (lessonId: string) => Promise<void>;
  completingLessonId: string | null;
}

function durationLabel(minutes: number): string {
  return `${minutes} min`;
}

export function CourseTree({
  node,
  enrolled,
  onCompleteLesson,
  completingLessonId,
}: CourseTreeProps): JSX.Element {
  const isLesson = node.kind === "lesson";
  const isCompleted = isLesson && node.progressPercent >= 100;

  return (
    <li className={`tree-node tree-node-${node.kind}`}>
      <div className="tree-row">
        <div>
          <p className="tree-title">{node.title}</p>
          <p className="tree-meta">
            {node.kind.toUpperCase()} · {durationLabel(node.durationMinutes)} · {node.progressPercent}%
          </p>
        </div>

        {isLesson ? (
          isCompleted ? (
            <span className="lesson-pill lesson-pill-done">Done</span>
          ) : (
            <button
              className="lesson-pill"
              disabled={!enrolled || completingLessonId === node.id}
              onClick={() => onCompleteLesson(node.id)}
              type="button"
            >
              {completingLessonId === node.id ? "Saving..." : "Complete"}
            </button>
          )
        ) : null}
      </div>

      {node.children.length > 0 ? (
        <ul className="tree-children">
          {node.children.map((child) => (
            <CourseTree
              key={child.id}
              node={child}
              enrolled={enrolled}
              onCompleteLesson={onCompleteLesson}
              completingLessonId={completingLessonId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
