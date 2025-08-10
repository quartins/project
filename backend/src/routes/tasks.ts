import express from "express";
import { dbClient } from "../../db/client.js";
import { tasks } from "../../db/schema.js";
import { eq , and} from "drizzle-orm";
//import { authMiddleware } from "../middleware/auth";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /tasks - แสดง tasks ของ user
router.get("/", authMiddleware ,async (req, res, next) => {
  try {
    const userId = req.userId!;
    const result = await dbClient.query.tasks.findMany({
      where: eq(tasks.userId, userId),
    });
        console.log(result); // <-- เพิ่มตรงนี้ เช็คข้อมูลที่ดึงมา

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    const result = await dbClient.query.tasks.findFirst({
      where: and(
        eq(tasks.id, taskId),
        eq(tasks.userId, userId)
      ),
    });

    if (!result) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - เพิ่ม task ใหม่
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { title, description, dueDate, status, subjectId } = req.body;

    const result = await dbClient
      .insert(tasks)
      .values({ title, description, dueDate, status, subjectId, userId })
      .returning();
    res.json(result[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);
    const { subjectId, title, description } = req.body;

    const updated = await dbClient
      .update(tasks)
      .set({ subjectId, title, description })
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Task not found or not yours" });
    }

    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    const deleted = await dbClient
      .delete(tasks)
      .where(and(
        eq(tasks.id, taskId),
        eq(tasks.userId, userId)
      ))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Task not found or not yours" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
