"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const r = (0, express_1.Router)();
// Function to normalize crane ID to standard format (TC1, TC2, etc.)
const normalizeCraneId = (craneId) => {
    const normalized = craneId.trim().toUpperCase();
    // Convert "CRANE 1" -> "TC1", "TC1" -> "TC1", etc.
    const match = normalized.match(/(?:CRANE\s*|TC\s*)(\d+)/);
    if (match) {
        return `TC${match[1]}`;
    }
    // If already in correct format, return as is
    if (normalized.startsWith('TC') && /^\d+$/.test(normalized.substring(2))) {
        return normalized;
    }
    return normalized;
};
// Schema for work log creation
const workLogCreateSchema = zod_1.z.object({
    crane_id: zod_1.z.string().min(1, "Crane ID is required"),
    operator_id: zod_1.z.string().min(1, "Operator ID is required"),
    operator_name: zod_1.z.string().min(1, "Operator name is required"),
    work_date: zod_1.z.string().min(1, "Work date is required"),
    shift: zod_1.z.enum(["morning", "afternoon", "night"]),
    actual_work: zod_1.z.string().min(1, "Actual work description is required"),
    actual_time: zod_1.z.number().int().positive("Actual time must be a positive number"),
    status: zod_1.z.enum(["ปกติ", "ล่าช้า", "เร่งด่วน", "เสร็จก่อน"]),
    note: zod_1.z.string().optional(),
});
// GET /api/work-logs - Get all work logs
r.get("/", async (req, res) => {
    console.log("Work logs GET route called at", new Date().toISOString());
    try {
        const { crane_id, operator_id, shift, status } = req.query;
        let sql = `
      SELECT
        id,
        crane_id,
        operator_id,
        operator_name,
        work_date,
        shift,
        actual_work,
        actual_time,
        status,
        note,
        created_at
      FROM work_logs
    `;
        const params = [];
        const conditions = [];
        if (crane_id) {
            conditions.push("crane_id = ?");
            params.push(crane_id);
        }
        if (operator_id) {
            conditions.push("operator_id = ?");
            params.push(operator_id);
        }
        if (shift) {
            conditions.push("shift = ?");
            params.push(shift);
        }
        if (status) {
            conditions.push("status = ?");
            params.push(status);
        }
        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }
        sql += " ORDER BY created_at DESC LIMIT 500";
        const result = db_1.default.query(sql, params);
        res.json(result);
    }
    catch (error) {
        console.error("Error fetching work logs:", error);
        res.status(500).json({ error: "Failed to fetch work logs" });
    }
});
// POST /api/work-logs - Create a new work log
r.post("/", async (req, res) => {
    try {
        // Validate the request body
        const validationResult = workLogCreateSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.flatten()
            });
        }
        let workLogData = validationResult.data;
        // Normalize crane ID to standard format
        workLogData.crane_id = normalizeCraneId(workLogData.crane_id);
        // Generate a unique ID for the work log
        const id = `worklog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();
        const sql = `
      INSERT INTO work_logs (
        id, crane_id, operator_id, operator_name, work_date, shift,
        actual_work, actual_time, status, note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const result = db_1.default.run(sql, id, workLogData.crane_id, workLogData.operator_id, workLogData.operator_name, workLogData.work_date, workLogData.shift, workLogData.actual_work, workLogData.actual_time, workLogData.status, workLogData.note || null, now);
        if (result.changes === 0) {
            throw new Error("Failed to create work log");
        }
        // Return the created work log in the expected format
        const createdWorkLog = {
            id,
            crane_id: workLogData.crane_id,
            operator_id: workLogData.operator_id,
            operator_name: workLogData.operator_name,
            work_date: workLogData.work_date,
            shift: workLogData.shift,
            actual_work: workLogData.actual_work,
            actual_time: workLogData.actual_time,
            status: workLogData.status,
            note: workLogData.note,
            created_at: now
        };
        res.status(201).json(createdWorkLog);
    }
    catch (error) {
        console.error("Error creating work log:", error);
        res.status(500).json({ error: "Failed to create work log: " + error.message });
    }
});
// PUT /api/work-logs/migrate - Migrate existing crane names to standardized format
r.put("/migrate", async (req, res) => {
    try {
        // Get all work logs
        const workLogs = db_1.default.query(`
      SELECT id, crane_id FROM work_logs ORDER BY created_at DESC
    `);
        let updated = 0;
        for (const log of workLogs) {
            const normalized = normalizeCraneId(log.crane_id);
            if (normalized !== log.crane_id) {
                db_1.default.run('UPDATE work_logs SET crane_id = ? WHERE id = ?', normalized, log.id);
                updated++;
            }
        }
        // Also check bookings
        const bookings = db_1.default.query('SELECT id, crane FROM bookings');
        let bookingUpdated = 0;
        for (const booking of bookings) {
            const normalized = normalizeCraneId(booking.crane);
            if (normalized !== booking.crane) {
                db_1.default.run('UPDATE bookings SET crane = ? WHERE id = ?', normalized, booking.id);
                bookingUpdated++;
            }
        }
        res.json({
            message: 'Migration completed',
            workLogsUpdated: updated,
            bookingsUpdated: bookingUpdated
        });
    }
    catch (error) {
        console.error("Error migrating crane names:", error);
        res.status(500).json({ error: "Failed to migrate crane names" });
    }
});
exports.default = r;
