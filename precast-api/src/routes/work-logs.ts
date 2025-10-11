import { Router } from "express";
import { z } from "zod";
import db from "../db";
import { normalizeCraneId } from "../utils";
import { requireManagerOrAdmin } from "../auth";

const r = Router();

// Schema for work log creation
const workLogCreateSchema = z.object({
  crane_id: z.string().min(1, "Crane ID is required"),
  operator_id: z.string().min(1, "Operator ID is required"),
  operator_name: z.string().min(1, "Operator name is required"),
  work_date: z.string().min(1, "Work date is required"),
  shift: z.enum(["morning", "afternoon", "night"]),
  actual_work: z.string().min(1, "Actual work description is required"),
  actual_time: z.number().int().positive("Actual time must be a positive number"),
  status: z.enum(["ปกติ", "ล่าช้า", "เร่งด่วน", "เสร็จก่อน"]),
  note: z.string().optional(),
});

// GET /api/work-logs - Get all work logs
r.get("/", async (req, res) => {
  console.log("GET /api/work-logs route handler called");
  console.log("Work logs GET route called at", new Date().toISOString());
  try {
    console.log("Inside worklogs GET try");
    const { crane_id, operator_id, shift, status } = req.query as any;

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

    const params: any[] = [];
    const conditions: string[] = [];

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

    const result = db.query(sql, params);
    res.json(result);
  } catch (error) {
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

    const result = db.run(sql,
      id,
      workLogData.crane_id,
      workLogData.operator_id,
      workLogData.operator_name,
      workLogData.work_date,
      workLogData.shift,
      workLogData.actual_work,
      workLogData.actual_time,
      workLogData.status,
      workLogData.note || null,
      now
    );

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

  } catch (error) {
    console.error("Error creating work log:", error);
    res.status(500).json({ error: "Failed to create work log: " + (error as Error).message });
  }
});

// PUT /api/work-logs/migrate - Migrate existing crane names to standardized format
r.put("/migrate", requireManagerOrAdmin, async (req, res) => {
  try {
    // Get all work logs
    const workLogs = db.query(`
      SELECT id, crane_id FROM work_logs ORDER BY created_at DESC
    `) as any[];

    let updated = 0;
    for (const log of workLogs) {
      const normalized = normalizeCraneId(log.crane_id);
      if (normalized !== log.crane_id) {
        db.run('UPDATE work_logs SET crane_id = ? WHERE id = ?', normalized, log.id);
        updated++;
      }
    }

    // Also check bookings
    const bookings = db.query('SELECT id, crane FROM bookings') as any[];
    let bookingUpdated = 0;
    for (const booking of bookings) {
      const normalized = normalizeCraneId(booking.crane);
      if (normalized !== booking.crane) {
        db.run('UPDATE bookings SET crane = ? WHERE id = ?', normalized, booking.id);
        bookingUpdated++;
      }
    }

    res.json({
      message: 'Migration completed',
      workLogsUpdated: updated,
      bookingsUpdated: bookingUpdated
    });
  } catch (error) {
    console.error("Error migrating crane names:", error);
    res.status(500).json({ error: "Failed to migrate crane names" });
  }
});

// GET /api/work-logs/ultimate - Get ultimate stats or advanced work logs
r.get("/ultimate", async (req, res) => {
  try {
    // Get advanced work log statistics or latest records
    const workLogs = db.query(`
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
      ORDER BY created_at DESC
      LIMIT 50
    `);
    res.json(workLogs);
  } catch (error) {
    console.error("Error fetching ultimate work logs:", error);
    res.status(500).json({ error: "Failed to fetch ultimate work logs" });
  }
});

// GET /api/work-logs/endpoint - Alternative endpoint for work logs
r.get("/endpoint", async (req, res) => {
  try {
    // Get work logs with additional filtering or processing
    const workLogs = db.query(`
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
      ORDER BY created_at DESC
      LIMIT 100
    `);
    res.json(workLogs);
  } catch (error) {
    console.error("Error fetching work logs endpoint:", error);
    res.status(500).json({ error: "Failed to fetch work logs endpoint" });
  }
});

// DELETE /api/work-logs/:id - Delete a work log
r.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingLog = db.query(`SELECT id FROM work_logs WHERE id = ?`, [id]);
    if (!existingLog.length) {
      return res.status(404).json({ error: "Work log not found" });
    }

    db.run(`DELETE FROM work_logs WHERE id = ?`, [id]);
    res.json({ message: "Work log deleted successfully" });
  } catch (error) {
    console.error("Error deleting work log:", error);
    res.status(500).json({ error: "Failed to delete work log" });
  }
});

export default r;
