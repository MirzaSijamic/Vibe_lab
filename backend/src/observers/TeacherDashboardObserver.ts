import { ProgressEvent, ProgressObserver } from "./ProgressObserver";

export interface TeacherEventMetric {
  key: string;
  count: number;
}

export class TeacherDashboardObserver implements ProgressObserver {
  private readonly eventCountMap = new Map<string, number>();

  public update(event: ProgressEvent): void {
    const key = `${event.courseId}:${event.type}`;
    const count = this.eventCountMap.get(key) ?? 0;
    this.eventCountMap.set(key, count + 1);
  }

  public getSnapshot(): TeacherEventMetric[] {
    return Array.from(this.eventCountMap.entries()).map(([key, count]) => ({
      key,
      count,
    }));
  }
}
