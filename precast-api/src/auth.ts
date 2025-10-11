import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type Role = "engineer" | "manager" | "admin";

export interface JwtPayload {
  userId: string;
  username: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      role?: Role;
      user?: JwtPayload;
    }
  }
}

export function withRole(req: Request, _res: Response, next: NextFunction) {
  const h = String(req.header("x-role") || "engineer").toLowerCase();
  const role: Role = (h === "admin" || h === "manager") ? h : "engineer";
  req.role = role;
  next();
}

export function requireManagerOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.role === "admin" || req.role === "manager") return next();
  return res.status(403).json({ error: "forbidden" });
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded;
    req.role = decoded.role;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    console.error("Token verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
