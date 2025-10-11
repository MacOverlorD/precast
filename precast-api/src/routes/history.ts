import { Router } from "express";
import db from "../db";
const r = Router();

r.get("/", async (req,res) => {
  const { crane, q } = req.query as any;
  let sql = `SELECT * FROM history`;
  const p: any[] = [];
  const conditions: string[] = [];

  if (crane && crane !== 'ALL') {
    conditions.push(`crane=?`);
    p.push(String(crane));
  }

  if (q) {
    conditions.push(`(piece LIKE ? OR crane LIKE ? OR status LIKE ?)`);
    const searchTerm = `%${String(q)}%`;
    p.push(searchTerm, searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  sql += ` ORDER BY end_ts DESC LIMIT 500`;
  const result = db.query(sql, p);
  res.json(result);
});

export default r;
