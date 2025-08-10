import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // ถ้า user.id เป็น UUID
    }
  }
}
