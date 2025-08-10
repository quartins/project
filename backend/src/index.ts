/// Login OK ------
import "dotenv/config";
import { dbClient } from "@db/client.js";
import { todoTable } from "@db/schema.js";
import cors from "cors";
import Debug from "debug";
import { eq } from "drizzle-orm";
import type { ErrorRequestHandler } from "express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import subjectRoutes from "./routes/subjects.ts";
import taskRoutes from "./routes/tasks.ts";

const debug = Debug("pf-backend");
const app = express();

// Middleware
app.use(morgan("dev", { immediate: false }));
app.use(helmet());
app.use(
  cors({
    origin: false, 
  })
);
app.use(express.json());

// ✅ ใช้ /api/* สำหรับทุกเส้นทาง
app.use("/auth", authRoutes); 
app.use("/subjects", subjectRoutes);
app.use("/tasks", taskRoutes);



// Error Middleware
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  debug(err.message);
  res.status(500).send({
    message: err.message || "Internal Server Error",
    type: err.name || "Error",
    stack: err.stack,
  });
};
app.use(jsonErrorHandler);

// Start app
const PORT = process.env.PORT || 3763;
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
