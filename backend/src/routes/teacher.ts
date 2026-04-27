import express from "express";
import { asyncHandler } from "./asyncHandler";
import { teacherDashboardObserver } from "../services/serviceContainer";

const router = express.Router();

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    res.json({ metrics: teacherDashboardObserver.getSnapshot() });
  }),
);

export default router;
