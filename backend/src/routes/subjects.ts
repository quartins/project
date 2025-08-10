import express from "express";
import { dbClient } from "../../db/client.js";
import { subjects } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /subjects - เอาทุก subject ของ user
// use http://localhost:3000/api/subjects
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const result = await dbClient.query.subjects.findMany({
      where: eq(subjects.userId, userId),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /subjects - เพิ่ม subject ใหม่
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { name } = req.body;

    const result = await dbClient
      .insert(subjects)
      .values({ name, userId })
      .returning();
    res.json(result[0]);
  } catch (err) {
    next(err);
  }
});

// GET /subjects/:id - เอา subject ตาม id ของ user
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const subjectId = parseInt(req.params.id, 10);

    const result = await dbClient.query.subjects.findFirst({
      where: and(
        eq(subjects.id, subjectId),
        eq(subjects.userId, userId)
      ),
    });

    if (!result) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const subjectId = parseInt(req.params.id, 10);
    const { name } = req.body;

    const updated = await dbClient
      .update(subjects)
      .set({ name })
      .where(and(
        eq(subjects.id, subjectId),
        eq(subjects.userId, userId)
      ))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Subject not found or not yours" });
    }

    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const subjectId = parseInt(req.params.id, 10);

    const deleted = await dbClient
      .delete(subjects)
      .where(and(
        eq(subjects.id, subjectId),
        eq(subjects.userId, userId)
      ))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Subject not found or not yours" });
    }

    res.json({ message: "Subject deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
