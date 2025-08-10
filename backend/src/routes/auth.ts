// // src/routes/auth.ts
// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { dbClient } from "../../db/client.js";
// import { users } from "../../db/schema.js";
// import { eq } from "drizzle-orm";

// const router = express.Router();

// // ✅ Signup
// router.post("/signup", async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password)
//       return res.status(400).json({ error: "All fields are required" });

//     const existingUser = await dbClient
//       .select()
//       .from(users)
//       .where(eq(users.email, email));

//     if (existingUser.length > 0)
//       return res.status(409).json({ error: "Email already in use" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const result = await dbClient.insert(users).values({
//       name,
//       email,
//       password: hashedPassword,
//     }).returning({
//       id: users.id,
//       name: users.name,
//       email: users.email,
//     });

//     return res.status(201).json({ message: "Signup successful", user: result[0] });
//   } catch (err) {
//     next(err);
//   }
// });

// // ✅ Login
// router.post("/login", async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ error: "Email and password required" });

//     const result = await dbClient
//       .select()
//       .from(users)
//       .where(eq(users.email, email));

//     const user = result[0];
//     if (!user)
//       return res.status(404).json({ error: "User not found" });

//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch)
//       return res.status(401).json({ error: "Invalid password" });

//     const token = jwt.sign(
//       { userId: user.id, email: user.email, name: user.name }, // เพิ่ม name
//       process.env.JWT_SECRET || "default-secret",
//       { expiresIn: "2h" }
//     );
//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// export default router;

// src/routes/auth.ts

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbClient } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// ✅ Signup
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existingUser = await dbClient
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0)
      return res.status(409).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbClient.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

    return res.status(201).json({ message: "Signup successful", user: result[0] });
  } catch (err) {
    next(err);
  }
});

// ✅ Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const result = await dbClient
      .select()
      .from(users)
      .where(eq(users.email, email));

    const user = result[0];
    if (!user)
      return res.status(404).json({ error: "User not found" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const allUsers = await dbClient
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role, // ถ้ามี column role
        created_at: users.created_at,
      })
      .from(users);

    res.status(200).json(allUsers);
  } catch (err) {
    next(err);
  }
});

export default router;