import express from "express";
import { asyncHandler } from "./asyncHandler";
import { enrollmentFacade } from "../services/serviceContainer";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { studentName, courseId } = req.body as {
      studentName?: string;
      courseId?: string;
    };

    const enrollment = await enrollmentFacade.enroll(studentName ?? "", courseId ?? "");
    res.status(enrollment.alreadyEnrolled ? 200 : 201).json(enrollment);
  }),
);

export default router;
