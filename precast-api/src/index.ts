import express from "express";
import cors from "cors";
import { verifyToken } from "./auth";
import * as authRoutes from "./routes/auth";
import bookings from "./routes/bookings";
import cranes from "./routes/cranes";
import history from "./routes/history";
import workLogs from "./routes/work-logs";
import workTypes from "./routes/work-types";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req,res)=> res.json({ ok: true, time: Date.now() }));

// Auth routes (public)
console.log('Setting up routes...B 1');
app.post("/api/auth/login", authRoutes.login);
app.post("/api/auth/register", authRoutes.register);
console.log('Setting up routes...B 2');

// Public routes (work-types is static data)
app.use("/api/work-types", workTypes);

// Protected routes
app.use(verifyToken); // Apply token verification to all subsequent routes
app.use("/api/auth/profile", authRoutes.getProfile);
app.use("/api/bookings", bookings);
app.use("/api/cranes", cranes);
app.use("/api/history", history);
app.use("/api/work-logs", workLogs);

// Add catch-all route to debug 404s
app.use((req, res, next) => {
  console.log(`No route found for: ${req.method} ${req.path}`);
  res.status(404).json({error: 'Route not found', method: req.method, path: req.path});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
