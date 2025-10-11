"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRole = withRole;
exports.requireManagerOrAdmin = requireManagerOrAdmin;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function withRole(req, _res, next) {
    const h = String(req.header("x-role") || "engineer").toLowerCase();
    const role = (h === "admin" || h === "manager") ? h : "engineer";
    req.role = role;
    next();
}
function requireManagerOrAdmin(req, res, next) {
    if (req.role === "admin" || req.role === "manager")
        return next();
    return res.status(403).json({ error: "forbidden" });
}
function verifyToken(req, res, next) {
    try {
        const authHeader = req.header("Authorization");
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({ error: "Access token required" });
        }
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        req.role = decoded.role;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ error: "Invalid token" });
        }
        console.error("Token verification error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
