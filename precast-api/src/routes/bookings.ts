import { Router } from "express";
import db from "../db";
import { bookingCreate, bookingStatus } from "../schemas";
import { requireManagerOrAdmin } from "../auth";
import { normalizeCraneId } from "../utils";

const r = Router();

// สร้าง booking (ทุก role) - รวมการสร้างคิวโดยตรง
r.post("/", async (req, res) => {
  const parsed = bookingCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const b = parsed.data;
  const normalizedCraneId = normalizeCraneId(b.crane);

  // ตรวจสอบว่าอยากสร้างแบบจองคิว (ต้องอนุมัติ) หรือ จัดคิวโดยตรง (ไม่ต้องอนุมัติ)
  const directToQueue = req.body.directToQueue;

  if (directToQueue) {
    // จัดคิวโดยตรง - ไม่ต้องอนุมัติ
    const maxOrdResult = db.get(`SELECT MAX(ord) as max_ord FROM queue WHERE crane_id=?`, normalizedCraneId) as { max_ord: number };
    const nextOrd = (maxOrdResult?.max_ord || 0) + 1;

    // แทรกเข้าคิวโดยตรง
    db.run(`INSERT INTO queue(crane_id, ord, piece, note, status, requester, phone, purpose, start_ts, end_ts, work_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
           normalizedCraneId, nextOrd, b.item, b.note || null, 'pending',
           b.requester, b.phone, b.purpose, b.start, b.end, null);

    res.json({ id: `QUEUE-${normalizedCraneId}-${nextOrd}`, status: 'pending', type: 'direct-queue', ord: nextOrd });
  } else {
    // จองคิวแบบเดิม (ต้องอนุมัติ)
    const countResult = db.get("SELECT COUNT(*) as c FROM bookings") as { c: number };
    const count = countResult.c + 1;
    const id = `BK-${String(count).padStart(3,'0')}`;
    const status = "รอการอนุมัติ";
    db.run(`
      INSERT INTO bookings(id, crane, item, requester, phone, purpose, start_ts, end_ts, note, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, id, normalizedCraneId, b.item, b.requester, b.phone, b.purpose, b.start, b.end, b.note||null, status, Date.now());
    res.json({ id, status, type: 'booking' });
  }
});

// list bookings (กรองได้)
r.get("/", async (req, res) => {
  const { status, crane, q } = req.query as any;
  let sql = `SELECT * FROM bookings WHERE 1=1`;
  const p: any[] = [];
  if (status) { sql += ` AND status=?`; p.push(String(status)); }
  if (crane)  { sql += ` AND crane=?`;  p.push(normalizeCraneId(String(crane))); }
  if (q)      { sql += ` AND (item LIKE ? OR requester LIKE ?)`; p.push(`%${q}%`,`%${q}%`); }
  sql += ` ORDER BY created_at DESC LIMIT 200`;
  const result = db.query(sql, p);
  res.json(result);
});

// เปลี่ยนสถานะ (manager/admin เท่านั้น)
r.patch("/:id/status", requireManagerOrAdmin, async (req, res) => {
  const s = bookingStatus.safeParse(req.body?.status);
  if (!s.success) return res.status(400).json({ error: "invalid status" });

  const bookingResult = db.get(`SELECT * FROM bookings WHERE id=?`, req.params.id) as any;
  if (!bookingResult) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const newStatus = s.data;

  // Use a transaction to ensure atomicity
  const transaction = db.transaction(() => {
    const result = db.run(`UPDATE bookings SET status=? WHERE id=?`, newStatus, req.params.id);

    // If approving booking, add to queue
    if (result.changes > 0 && newStatus === 'อนุมัติ') {
      const maxOrdResult = db.get(`SELECT MAX(ord) as max_ord FROM queue WHERE crane_id=?`, bookingResult.crane) as { max_ord: number };
      const nextOrd = (maxOrdResult?.max_ord || 0) + 1;

      // Add to queue with status 'pending'
      db.run(`INSERT INTO queue(crane_id, ord, piece, note, status, booking_id) VALUES(?, ?, ?, ?, ?, ?)`,
             bookingResult.crane, nextOrd, bookingResult.item, bookingResult.purpose, 'pending', bookingResult.id);
    }
    return result.changes;
  });

  const updatedCount = transaction();
  res.json({ updated: updatedCount });
});

// ใช้ทำปฏิทิน: ดึงของเครนและช่วงเดือน
r.get("/calendar", async (req,res) => {
  const { crane, from, to } = req.query as any;
  const result = db.query(`
    SELECT id, item, crane, start_ts, end_ts, status
    FROM bookings
    WHERE crane=? AND start_ts >= ? AND end_ts <= ?
    ORDER BY start_ts
  `, [normalizeCraneId(String(crane)), Number(from), Number(to)]);
  res.json(result);
});

export default r;
