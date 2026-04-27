import express from "express";
import { asyncHandler } from "./asyncHandler";
import { quizService } from "../services/serviceContainer";

const router = express.Router();

router.post(
  "/:quizId/submit",
  asyncHandler(async (req, res) => {
    const { studentId, courseId, answers } = req.body as {
      studentId?: string;
      courseId?: string;
      answers?: Record<string, unknown>;
    };

    const result = await quizService.submitQuiz({
      studentId: studentId ?? "",
      courseId: courseId ?? "",
      quizId: req.params.quizId,
      answers: answers ?? {},
    });

    res.json(result);
  }),
);

export default router;
