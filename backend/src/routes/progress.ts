import express from "express";
import { asyncHandler } from "./asyncHandler";
import { progressService } from "../services/serviceContainer";

const router = express.Router();

router.get(
  "/students/:studentId/progress",
  asyncHandler(async (req, res) => {
    const courseId = typeof req.query.courseId === "string" ? req.query.courseId : "";
    if (!courseId) {
      res.status(400).json({ message: "courseId query parameter is required." });
      return;
    }

    const progress = await progressService.getSummary(req.params.studentId, courseId);
    res.json({ progress });
  }),
);

export default router;
