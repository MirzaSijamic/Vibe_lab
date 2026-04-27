import { ProgressEvent, ProgressObserver } from "./ProgressObserver";
import { NotificationCenter } from "../services/NotificationCenter";

export class AchievementObserver implements ProgressObserver {
  private readonly notificationCenter: NotificationCenter;

  constructor(notificationCenter: NotificationCenter) {
    this.notificationCenter = notificationCenter;
  }

  public update(event: ProgressEvent): void {
    if (event.progressPercent < 100) {
      return;
    }

    this.notificationCenter.addMessage(
      event.studentId,
      "[Achievement] Course complete badge unlocked.",
    );
  }
}
