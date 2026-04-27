import { CourseRecord } from "../../types";
import { CourseRootComponent, LessonComponent, ModuleComponent } from "./components";

export const buildCourseComposite = (course: CourseRecord): CourseRootComponent => {
  const moduleComponents = course.modules.map((moduleRecord) => {
    const lessonComponents = moduleRecord.lessons.map(
      (lessonRecord) =>
        new LessonComponent(lessonRecord.id, lessonRecord.title, lessonRecord.durationMinutes),
    );

    return new ModuleComponent(moduleRecord.id, moduleRecord.title, lessonComponents);
  });

  return new CourseRootComponent(course.id, course.title, moduleComponents);
};
