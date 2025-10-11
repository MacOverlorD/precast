"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
// Database configuration
const dbPath = process.env.DB_PATH || './precast.db';
console.log('DbPath used:', dbPath, 'cwd:', process.cwd());
const db = new better_sqlite3_1.default(dbPath);
// Database connection established
// Initialize database tables
function initializeDatabase() {
    try {
        // Temporarily disable foreign key constraints
        db.pragma('foreign_keys = OFF');
        // Create tables
        db.exec(`
      CREATE TABLE IF NOT EXISTS cranes (
        id TEXT PRIMARY KEY
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS queue (
        crane_id TEXT,
        ord INTEGER,
        piece TEXT,
        note TEXT,
        status TEXT CHECK(status IN ('pending','working','stopped','error','success')) NOT NULL DEFAULT 'pending',
        started_at INTEGER,
        ended_at INTEGER,
        booking_id TEXT,
        PRIMARY KEY(crane_id, ord),
        FOREIGN KEY(crane_id) REFERENCES cranes(id)
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        crane TEXT NOT NULL,
        item TEXT NOT NULL,
        requester TEXT NOT NULL,
        phone TEXT NOT NULL,
        purpose TEXT NOT NULL,
        start_ts INTEGER NOT NULL,
        end_ts INTEGER NOT NULL,
        note TEXT,
        status TEXT CHECK(status IN ('รอการอนุมัติ','อนุมัติ','ปฏิเสธ')) NOT NULL DEFAULT 'รอการอนุมัติ',
        created_at INTEGER NOT NULL
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        crane TEXT NOT NULL,
        piece TEXT NOT NULL,
        start_ts INTEGER,
        end_ts INTEGER,
        duration_min INTEGER,
        status TEXT
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('engineer','manager','admin')) NOT NULL DEFAULT 'engineer',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
        db.exec(`
      CREATE TABLE IF NOT EXISTS work_logs (
        id TEXT PRIMARY KEY,
        crane_id TEXT NOT NULL,
        operator_id TEXT NOT NULL,
        operator_name TEXT NOT NULL,
        work_date TEXT NOT NULL,
        shift TEXT CHECK(shift IN ('morning','afternoon','night')) NOT NULL,
        actual_work TEXT NOT NULL,
        actual_time INTEGER NOT NULL,
        status TEXT CHECK(status IN ('ปกติ','ล่าช้า','เร่งด่วน','เสร็จก่อน')) NOT NULL,
        note TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY(crane_id) REFERENCES cranes(id)
      )
    `);
        // Always seed cranes (ignore count)
        console.log('Database init - forcing crane seeding');
        // First clear any existing cranes
        db.exec('DELETE FROM cranes');
        const result = db.exec(`
      INSERT INTO cranes(id) VALUES
      ('TC1'), ('TC2'), ('TC3'), ('TC4')
    `);
        console.log('Database init - crane seeding result:', result);
        const newCraneCount = db.prepare('SELECT COUNT(*) as c FROM cranes').get();
        console.log('Database init - crane count after seeding:', newCraneCount.c);
        // Seed queue if empty
        const queueCount = db.prepare('SELECT COUNT(*) as c FROM queue').get();
        if (queueCount.c === 0) {
            db.exec(`
        INSERT OR IGNORE INTO queue(crane_id, ord, piece, note, status) VALUES
        ('TC1', 1, 'P1', 'งานแรก', 'pending'),
        ('TC1', 2, 'P2', 'งานที่สอง', 'pending'),
        ('TC1', 3, 'P3', 'งานที่สาม', 'pending'),
        ('TC2', 1, 'S1', 'งานแรก', 'pending'),
        ('TC2', 2, 'S2', 'งานที่สอง', 'pending'),
        ('TC3', 1, 'K1', 'งานแรก', 'pending'),
        ('TC3', 2, 'K2', 'งานที่สอง', 'pending'),
        ('TC4', 1, 'M1', 'งานแรก', 'pending')
      `);
        }
        // Seed admin user if no users exist
        const bcrypt = require("bcryptjs");
        const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
        if (userCount.c === 0) {
            const now = Date.now();
            const adminPasswordHash = bcrypt.hashSync("admin123", 10);
            db.prepare(`
        INSERT OR IGNORE INTO users (id, username, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(`admin_${now}`, "admin", adminPasswordHash, "admin", now, now);
        }
        // Re-enable foreign key constraints
        db.pragma('foreign_keys = ON');
        // Database initialized successfully
    }
    catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}
// Initialize database when module is loaded
initializeDatabase();
// Wrapper to make it compatible with existing code that expects pool.query
const dbWrapper = {
    query: (sql, params) => {
        const stmt = db.prepare(sql);
        if (params && params.length > 0) {
            return stmt.all(...params);
        }
        return stmt.all();
    },
    get: (sql, ...params) => {
        const stmt = db.prepare(sql);
        if (params && params.length > 0) {
            return stmt.get(...params);
        }
        return stmt.get();
    },
    run: (sql, ...params) => {
        const stmt = db.prepare(sql);
        if (params && params.length > 0) {
            return stmt.run(...params);
        }
        return stmt.run();
    }
};
exports.default = dbWrapper;
