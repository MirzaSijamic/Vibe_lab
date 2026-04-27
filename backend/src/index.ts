import cors from "cors";
import express from "express";
import { isHttpError } from "./errors/HttpError";
import coursesRouter from "./routes/courses";
import enrollmentsRouter from "./routes/enrollments";
import lessonsRouter from "./routes/lessons";
import progressRouter from "./routes/progress";
import quizzesRouter from "./routes/quizzes";
import teacherRouter from "./routes/teacher";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/courses", coursesRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api", progressRouter);
app.use("/api/teacher", teacherRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (isHttpError(error)) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  res.status(500).json({ message });
});

app.listen(port, () => {
  console.log(`LMS backend listening on http://localhost:${port}`);
});
