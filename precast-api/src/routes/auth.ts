import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db";
import { Role } from "../auth";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  role?: Role;
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body as LoginRequest;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user in database
    const userResult = db.get(`
      SELECT id, username, password_hash, role
      FROM users
      WHERE username = ?
    `, username) as any;
    const user = userResult;

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { username, password, role = "engineer" } = req.body as RegisterRequest;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUserResult = db.get("SELECT id FROM users WHERE username = ?", username) as any;
    const existingUser = existingUserResult;
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = bcrypt.hashSync(password, saltRounds);

    // Insert new user
    const now = Date.now();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    db.run(`
      INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, userId, username, password_hash, role, now, now);

    // Generate JWT token
    const token = jwt.sign(
      { userId, username, role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        username,
        role
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function getProfile(req: Request, res: Response) {
  try {
    // User info is available from JWT middleware
    res.json({
      user: {
        id: req.user?.userId,
        username: req.user?.username,
        role: req.user?.role
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
