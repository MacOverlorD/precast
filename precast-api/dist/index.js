"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./auth");
const authRoutes = __importStar(require("./routes/auth"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const cranes_1 = __importDefault(require("./routes/cranes"));
const history_1 = __importDefault(require("./routes/history"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
app.use(auth_1.withRole);
app.get("/api/health", (_req, res) => res.json({ ok: true, time: Date.now() }));
// Auth routes (public)
app.post("/api/auth/login", authRoutes.login);
app.post("/api/auth/register", authRoutes.register);
// Protected routes
app.use("/api/auth/profile", auth_1.verifyToken, authRoutes.getProfile);
app.use("/api/bookings", bookings_1.default);
app.use("/api/cranes", cranes_1.default);
app.use("/api/history", history_1.default);
const work_logs_1 = __importDefault(require("./routes/work-logs"));
// Register work-logs route
app.use("/api/work-logs", work_logs_1.default);
// Add a simple test route
app.get("/api/test-worklogs", (req, res) => {
    console.log("Test worklogs route called");
    res.json({ message: "worklogs route working", timestamp: Date.now() });
});
console.log("workLogs:", work_logs_1.default);
// Add catch-all route to debug 404s
app.use((req, res, next) => {
    console.log(`404 for: ${req.method} ${req.path}`);
    next();
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
