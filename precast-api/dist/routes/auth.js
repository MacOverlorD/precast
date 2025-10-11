"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.getProfile = getProfile;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
async function login(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        // Find user in database
        const userResult = db_1.default.get(`
      SELECT id, username, password_hash, role
      FROM users
      WHERE username = ?
    `, username);
        const user = userResult;
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Verify password
        const isValidPassword = bcryptjs_1.default.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function register(req, res) {
    try {
        const { username, password, role = "engineer" } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }
        // Check if user already exists
        const existingUserResult = db_1.default.get("SELECT id FROM users WHERE username = ?", username);
        const existingUser = existingUserResult;
        if (existingUser) {
            return res.status(409).json({ error: "Username already exists" });
        }
        // Hash password
        const saltRounds = 10;
        const password_hash = bcryptjs_1.default.hashSync(password, saltRounds);
        // Insert new user
        const now = Date.now();
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db_1.default.run(`
      INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, userId, username, password_hash, role, now, now);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId, username, role }, JWT_SECRET, { expiresIn: "24h" });
        res.status(201).json({
            token,
            user: {
                id: userId,
                username,
                role
            }
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
function getProfile(req, res) {
    try {
        // User info is available from JWT middleware
        res.json({
            user: {
                id: req.user?.userId,
                username: req.user?.username,
                role: req.user?.role
            }
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
