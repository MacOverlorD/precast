"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const schemas_1 = require("../schemas");
const auth_1 = require("../auth");
const r = (0, express_1.Router)();
// สร้าง booking (ทุก role)
r.post("/", async (req, res) => {
    const parsed = schemas_1.bookingCreate.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error.flatten());
    const b = parsed.data;
    const countResult = db_1.default.get("SELECT COUNT(*) as c FROM bookings");
    const count = countResult.c + 1;
    const id = `BK-${String(count).padStart(3, '0')}`;
    const status = "รอการอนุมัติ";
    db_1.default.run(`
    INSERT INTO bookings(id, crane, item, requester, phone, purpose, start_ts, end_ts, note, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, id, b.crane, b.item, b.requester, b.phone, b.purpose, b.start, b.end, b.note || null, status, Date.now());
    res.json({ id, status });
});
// list bookings (กรองได้)
r.get("/", async (req, res) => {
    const { status, crane, q } = req.query;
    let sql = `SELECT * FROM bookings WHERE 1=1`;
    const p = [];
    if (status) {
        sql += ` AND status=?`;
        p.push(String(status));
    }
    if (crane) {
        sql += ` AND crane=?`;
        p.push(String(crane));
    }
    if (q) {
        sql += ` AND (item LIKE ? OR requester LIKE ?)`;
        p.push(`%${q}%`, `%${q}%`);
    }
    sql += ` ORDER BY created_at DESC LIMIT 200`;
    const result = db_1.default.query(sql, p);
    res.json(result);
});
// เปลี่ยนสถานะ (manager/admin เท่านั้น)
r.patch("/:id/status", auth_1.requireManagerOrAdmin, async (req, res) => {
    const s = schemas_1.bookingStatus.safeParse(req.body?.status);
    if (!s.success)
        return res.status(400).json({ error: "invalid status" });
    const bookingResult = db_1.default.get(`SELECT * FROM bookings WHERE id=?`, req.params.id);
    const newStatus = s.data;
    const result = db_1.default.run(`UPDATE bookings SET status=? WHERE id=?`, newStatus, req.params.id);
    // If approving booking, add to queue and start work
    if (result.changes > 0 && newStatus === 'อนุมัติ' && bookingResult) {
        // Find the highest ord in queue for this crane
        const maxOrdResult = db_1.default.get(`SELECT MAX(ord) as max_ord FROM queue WHERE crane_id=?`, bookingResult.crane);
        const nextOrd = (maxOrdResult?.max_ord || 0) + 1;
        // Add to queue with status 'working'
        db_1.default.run(`INSERT INTO queue(crane_id, ord, piece, note, status, started_at, booking_id)
            VALUES(?, ?, ?, ?, ?, ?, ?)`, bookingResult.crane, nextOrd, bookingResult.item, bookingResult.purpose, 'working', Date.now(), bookingResult.id);
    }
    res.json({ updated: result.changes });
});
// ใช้ทำปฏิทิน: ดึงของเครนและช่วงเดือน
r.get("/calendar", async (req, res) => {
    const { crane, from, to } = req.query;
    const result = db_1.default.query(`
    SELECT id, item, crane, start_ts, end_ts, status
    FROM bookings
    WHERE crane=? AND start_ts >= ? AND end_ts <= ?
    ORDER BY start_ts
  `, [String(crane), Number(from), Number(to)]);
    res.json(result);
});
exports.default = r;
