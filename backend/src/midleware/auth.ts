// src/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log("GET /api/subjects/:id called with id=", req.params.id);
  console.log("authMiddleware called for path:", req.path);
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret") as {
      userId: string;
    };
    console.log("Decoded userId:", decoded.userId);

    req.userId = decoded.userId; // ✅ ปักหมุดตรงนี้!
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
