import { ProgressEvent, ProgressObserver } from "./ProgressObserver";
import { NotificationCenter } from "../services/NotificationCenter";

export class ProgressBarObserver implements ProgressObserver {
  private readonly notificationCenter: NotificationCenter;

  constructor(notificationCenter: NotificationCenter) {
    this.notificationCenter = notificationCenter;
  }

  public update(event: ProgressEvent): void {
    this.notificationCenter.addMessage(
      event.studentId,
      `[Progress] ${event.message} (${event.progressPercent}%)`,
    );
  }
}
