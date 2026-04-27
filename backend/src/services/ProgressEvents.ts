import { AchievementObserver } from "../observers/AchievementObserver";
import { ProgressBarObserver } from "../observers/ProgressBarObserver";
import { ProgressSubject } from "../observers/ProgressObserver";
import { TeacherDashboardObserver } from "../observers/TeacherDashboardObserver";
import { NotificationCenter } from "./NotificationCenter";

export const notificationCenter = new NotificationCenter();
export const teacherDashboardObserver = new TeacherDashboardObserver();
export const progressSubject = new ProgressSubject();

progressSubject.subscribe(new ProgressBarObserver(notificationCenter));
progressSubject.subscribe(new AchievementObserver(notificationCenter));
progressSubject.subscribe(teacherDashboardObserver);
