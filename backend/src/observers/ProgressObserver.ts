export type ProgressEventType = "enrolled" | "lesson-completed" | "quiz-submitted";

export interface ProgressEvent {
  studentId: string;
  courseId: string;
  type: ProgressEventType;
  message: string;
  progressPercent: number;
  timestamp: string;
}

export interface ProgressObserver {
  update(event: ProgressEvent): void;
}

export class ProgressSubject {
  private readonly observers = new Set<ProgressObserver>();

  public subscribe(observer: ProgressObserver): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: ProgressObserver): void {
    this.observers.delete(observer);
  }

  public notify(event: ProgressEvent): void {
    this.observers.forEach((observer) => observer.update(event));
  }
}
