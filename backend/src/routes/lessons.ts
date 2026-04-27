import express from "express";
import { asyncHandler } from "./asyncHandler";
import { progressService } from "../services/serviceContainer";

const router = express.Router();

router.post(
  "/:lessonId/complete",
  asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.body as {
      studentId?: string;
      courseId?: string;
    };

    if (!studentId || !courseId) {
      res.status(400).json({ message: "studentId and courseId are required." });
      return;
    }

    const progress = await progressService.markLessonComplete(
      studentId,
      courseId,
      req.params.lessonId,
    );

    res.json({ progress });
  }),
);

export default router;
