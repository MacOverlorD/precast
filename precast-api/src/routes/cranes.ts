import { Router } from "express";
import db from "../db";

const r = Router();

// อ่านคิวทุกเครน
r.get("/", async (_req, res) => {
  const cranesResult = db.query(`SELECT id FROM cranes`);
  console.log('Cranes from db:', cranesResult);
  const cranes = cranesResult;
  const data = await Promise.all(cranes.map(async (c:any) => {
    const queueResult = db.query(`SELECT ord, piece, note, status, started_at, ended_at, booking_id FROM queue WHERE crane_id=? ORDER BY ord`, [c.id]);
    // Rename to match frontend expectation and include booking_id
    const renamedQueue = queueResult.map((item: any) => ({
      ...item,
      order: item.ord
    }));
    return { id: c.id, queue: renamedQueue };
  }));

  // Auto-complete working bookings past end time
  const now = Date.now();
  for (const crane of data) {
    for (const item of crane.queue as any[]) {
      if (item.status === 'working' && item.booking_id) {
        const booking = db.get(`SELECT end_ts FROM bookings WHERE id=?`, item.booking_id) as { end_ts: number };
        if (booking && now >= booking.end_ts) {
          // Set to success
          db.run(`UPDATE queue SET status='success' WHERE crane_id=? AND ord=?`, crane.id, item.ord);
          // Save history
          const startedAt = item.started_at;
          const duration = startedAt ? Math.round((now - startedAt) / 60000) : null;
          const hid = `${crane.id}-${item.ord}-${now}`;
          db.run(`INSERT OR REPLACE INTO history(id, crane, piece, start_ts, end_ts, duration_min, status)
                          VALUES(?, ?, ?, ?, ?, ?, ?)`,
                 hid, crane.id, item.piece, startedAt, now, duration, 'success');
          console.log(`Auto-completed booking work for ${crane.id} ord ${item.ord}`);
        }
      }
    }
  }

  res.json(data);
});

// เพิ่มเครนใหม่
r.post("/", async (req, res) => {
  const { id } = req.body;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ error: 'กรุณาระบุ ID ของเครน' });
  }

  try {
    // ตรวจสอบว่าเครนนี้มีอยู่แล้วหรือไม่
    const existingCrane = db.get(`SELECT id FROM cranes WHERE id = ?`, id.trim()) as any;
    if (existingCrane) {
      return res.status(409).json({ error: 'เครนนี้มีอยู่แล้ว' });
    }

    // เพิ่มเครนใหม่
    db.run(`INSERT INTO cranes(id) VALUES(?)`, id.trim());
    res.status(201).json({ message: 'เพิ่มเครนสำเร็จ', craneId: id.trim() });
  } catch (error) {
    console.error('Error creating crane:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มเครน' });
  }
});

// ลบเครน
r.delete("/:craneId", async (req, res) => {
  const { craneId } = req.params;

  try {
    // ตรวจสอบว่าเครนมีอยู่หรือไม่
    const existingCrane = db.get(`SELECT id FROM cranes WHERE id = ?`, craneId) as any;
    if (!existingCrane) {
      return res.status(404).json({ error: 'ไม่พบเครนนี้' });
    }

    // ลบงานในคิวก่อน
    db.run(`DELETE FROM queue WHERE crane_id=?`, craneId);

    // ลบเครน
    db.run(`DELETE FROM cranes WHERE id=?`, craneId);

    res.json({ message: 'ลบเครนสำเร็จ', craneId });
  } catch (error) {
    console.error('Error deleting crane:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบเครน' });
  }
});

// start
r.post("/:craneId/start/:ord", async (req,res) => {
  const { craneId, ord } = req.params;
  const now = Date.now();
  const result = db.run(`UPDATE queue SET status='working', started_at=?, ended_at=NULL WHERE crane_id=? AND ord=? AND status='pending'`, now, craneId, Number(ord));
  res.json({ updated: result.changes });
});

// stop (set to success status for completed work)
r.post("/:craneId/stop/:ord", async (req,res) => {
  const { craneId, ord } = req.params;
  const now = Date.now();
  const rowResult = db.get(`SELECT * FROM queue WHERE crane_id=? AND ord=?`, craneId, Number(ord)) as any;
  const row = rowResult;
  if (!row || row.status !== 'working') return res.json({ updated: 0 });

  // Set to success instead of stopped for completed work
  db.run(`UPDATE queue SET status='success', ended_at=? WHERE crane_id=? AND ord=?`, now, craneId, Number(ord));

  // Create history entry for the completed work
  const startedAt = row.started_at;
  const duration = startedAt ? Math.round((now - startedAt) / 60000) : null;
  const hid = `${craneId}-${ord}-${now}`;
  db.run(`INSERT OR REPLACE INTO history(id, crane, piece, start_ts, end_ts, duration_min, status)
                  VALUES(?, ?, ?, ?, ?, ?, ?)`,
         hid, craneId, row.piece, startedAt, now, duration, 'success');

  res.json({ updated: 1 });
});

// rollback (stopped -> working, success -> working, working -> pending)
r.post("/:craneId/rollback/:ord", async (req,res) => {
  const { craneId, ord } = req.params;
  const rowResult = db.get(`SELECT * FROM queue WHERE crane_id=? AND ord=?`, craneId, Number(ord)) as any;
  const row = rowResult;
  if (!row) return res.json({ updated: 0 });

  if (row.status === 'stopped') {
    const result = db.run(`UPDATE queue SET status='working', ended_at=NULL WHERE crane_id=? AND ord=?`, craneId, Number(ord));
    return res.json({ updated: result.changes, to: 'working' });
  }
  if (row.status === 'success') {
    const result = db.run(`UPDATE queue SET status='working', ended_at=NULL WHERE crane_id=? AND ord=?`, craneId, Number(ord));
    return res.json({ updated: result.changes, to: 'working' });
  }
  if (row.status === 'working') {
    const result = db.run(`UPDATE queue SET status='pending', started_at=NULL, ended_at=NULL WHERE crane_id=? AND ord=?`, craneId, Number(ord));
    return res.json({ updated: result.changes, to: 'pending' });
  }
  res.json({ updated: 0 });
});

// เพิ่มคิวใหม่ (รวมฟีตเจอร์ จองคิว และ จัดคิว)
r.post("/:craneId/queue", async (req, res) => {
  const { craneId } = req.params;
  const { piece, note, workType, requester, phone, purpose, start, end } = req.body;

  if (!piece || typeof piece !== 'string' || piece.trim() === '') {
    return res.status(400).json({ error: 'กรุณาระบุชิ้นงาน' });
  }

  try {
    // ตรวจสอบว่าเครนมีอยู่หรือไม่
    const craneResult = db.get(`SELECT id FROM cranes WHERE id = ?`, craneId) as any;
    if (!craneResult) {
      return res.status(404).json({ error: 'ไม่พบเครนนี้' });
    }

    // หาคิวลำดับสุดท้ายสำหรับเครนนี้
    const maxOrdResult = db.get(`SELECT MAX(ord) as max_ord FROM queue WHERE crane_id=?`, craneId) as any;
    const nextOrd = (maxOrdResult?.max_ord || 0) + 1;

    // เพิ่มคิวใหม่ด้วยข้อมูลครบถ้วน (รวมจองคิวและจัดคิว)
    const startTs = start ? new Date(start).getTime() : null;
    const endTs = end ? new Date(end).getTime() : null;

    db.run(`INSERT INTO queue(crane_id, ord, piece, note, status, requester, phone, purpose, start_ts, end_ts, work_type) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
           craneId, nextOrd, piece.trim(), note?.trim() || null, 'pending',
           requester?.trim() || null, phone?.trim() || null, purpose?.trim() || null,
           startTs, endTs, workType || null);

    res.status(201).json({ message: 'เพิ่มงานในคิวสำเร็จ', craneId, ord: nextOrd });
  } catch (error) {
    console.error('Error adding queue item:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มงาน' });
  }
});

// ลบงานในคิว
r.delete("/:craneId/queue/:ord", async (req, res) => {
  const { craneId, ord } = req.params;

  try {
    // ตรวจสอบว่าเครนมีอยู่หรือไม่
    const existingCrane = db.get(`SELECT id FROM cranes WHERE id = ?`, craneId) as any;
    if (!existingCrane) {
      return res.status(404).json({ error: 'ไม่พบเครนนี้' });
    }

    // ลบงานในคิว
    const result = db.run(`DELETE FROM queue WHERE crane_id=? AND ord=?`, craneId, Number(ord));
    if (result.changes === 0) {
      return res.status(404).json({ error: 'ไม่พบงานในคิวนี้' });
    }

    res.json({ message: 'ลบงานในคิวสำเร็จ', craneId, ord: Number(ord) });
  } catch (error) {
    console.error('Error deleting queue item:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบงาน' });
  }
});

export default r;
