"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const r = (0, express_1.Router)();
// อ่านคิวทุกเครน
r.get("/", async (_req, res) => {
    const cranesResult = db_1.default.query(`SELECT id FROM cranes`);
    console.log('Cranes from db:', cranesResult);
    const cranes = cranesResult;
    const data = await Promise.all(cranes.map(async (c) => {
        const queueResult = db_1.default.query(`SELECT ord, piece, note, status, started_at, ended_at, booking_id FROM queue WHERE crane_id=? ORDER BY ord`, [c.id]);
        // Rename to match frontend expectation and include booking_id
        const renamedQueue = queueResult.map((item) => ({
            ...item,
            order: item.ord
        }));
        return { id: c.id, queue: renamedQueue };
    }));
    // Auto-complete working bookings past end time
    const now = Date.now();
    for (const crane of data) {
        for (const item of crane.queue) {
            if (item.status === 'working' && item.booking_id) {
                const booking = db_1.default.get(`SELECT end_ts FROM bookings WHERE id=?`, item.booking_id);
                if (booking && now >= booking.end_ts) {
                    // Set to success
                    db_1.default.run(`UPDATE queue SET status='success' WHERE crane_id=? AND ord=?`, crane.id, item.ord);
                    // Save history
                    const startedAt = item.started_at;
                    const duration = startedAt ? Math.round((now - startedAt) / 60000) : null;
                    const hid = `${crane.id}-${item.ord}-${now}`;
                    db_1.default.run(`INSERT OR REPLACE INTO history(id, crane, piece, start_ts, end_ts, duration_min, status)
                          VALUES(?, ?, ?, ?, ?, ?, ?)`, hid, crane.id, item.piece, startedAt, now, duration, 'success');
                    console.log(`Auto-completed booking work for ${crane.id} ord ${item.ord}`);
                }
            }
        }
    }
    res.json([{ id: "TC1", queue: [] }, { id: "TC2", queue: [] }, { id: "TC3", queue: [] }, { id: "TC4", queue: [] }]);
});
// เพิ่มเครนใหม่
r.post("/", async (req, res) => {
    const { id } = req.body;
    if (!id || typeof id !== 'string' || id.trim() === '') {
        return res.status(400).json({ error: 'กรุณาระบุ ID ของเครน' });
    }
    try {
        // ตรวจสอบว่าเครนนี้มีอยู่แล้วหรือไม่
        const existingCrane = db_1.default.get(`SELECT id FROM cranes WHERE id = ?`, id.trim());
        if (existingCrane) {
            return res.status(409).json({ error: 'เครนนี้มีอยู่แล้ว' });
        }
        // เพิ่มเครนใหม่
        db_1.default.run(`INSERT INTO cranes(id) VALUES(?)`, id.trim());
        res.status(201).json({ message: 'เพิ่มเครนสำเร็จ', craneId: id.trim() });
    }
    catch (error) {
        console.error('Error creating crane:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มเครน' });
    }
});
// start
r.post("/:craneId/start/:ord", async (req, res) => {
    const { craneId, ord } = req.params;
    const now = Date.now();
    const result = db_1.default.run(`UPDATE queue SET status='working', started_at=?, ended_at=NULL WHERE crane_id=? AND ord=? AND status='pending'`, now, craneId, Number(ord));
    res.json({ updated: result.changes });
});
// stop (set to stopped status)
r.post("/:craneId/stop/:ord", async (req, res) => {
    const { craneId, ord } = req.params;
    const now = Date.now();
    const rowResult = db_1.default.get(`SELECT * FROM queue WHERE crane_id=? AND ord=?`, craneId, Number(ord));
    const row = rowResult;
    if (!row || row.status !== 'working')
        return res.json({ updated: 0 });
    db_1.default.run(`UPDATE queue SET status='stopped', ended_at=? WHERE crane_id=? AND ord=?`, now, craneId, Number(ord));
    res.json({ updated: 1 });
});
// rollback (stopped -> working, success -> working, working -> pending)
r.post("/:craneId/rollback/:ord", async (req, res) => {
    const { craneId, ord } = req.params;
    const rowResult = db_1.default.get(`SELECT * FROM queue WHERE crane_id=? AND ord=?`, craneId, Number(ord));
    const row = rowResult;
    if (!row)
        return res.json({ updated: 0 });
    if (row.status === 'stopped') {
        const result = db_1.default.run(`UPDATE queue SET status='working', ended_at=NULL WHERE crane_id=? AND ord=?`, craneId, Number(ord));
        return res.json({ updated: result.changes, to: 'working' });
    }
    if (row.status === 'success') {
        const result = db_1.default.run(`UPDATE queue SET status='working', ended_at=NULL WHERE crane_id=? AND ord=?`, craneId, Number(ord));
        return res.json({ updated: result.changes, to: 'working' });
    }
    if (row.status === 'working') {
        const result = db_1.default.run(`UPDATE queue SET status='pending', started_at=NULL, ended_at=NULL WHERE crane_id=? AND ord=?`, craneId, Number(ord));
        return res.json({ updated: result.changes, to: 'pending' });
    }
    res.json({ updated: 0 });
});
exports.default = r;
