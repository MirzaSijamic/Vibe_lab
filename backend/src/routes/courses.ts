import express from "express";
import { asyncHandler } from "./asyncHandler";
import { courseService } from "../services/serviceContainer";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const studentId =
      typeof req.query.studentId === "string" ? req.query.studentId : undefined;
    const courses = await courseService.listCourses(studentId);
    res.json({ courses });
  }),
);

router.get(
  "/:courseId",
  asyncHandler(async (req, res) => {
    const studentId =
      typeof req.query.studentId === "string" ? req.query.studentId : undefined;
    const course = await courseService.getCourse(req.params.courseId, studentId);
    res.json({ course });
  }),
);

export default router;
