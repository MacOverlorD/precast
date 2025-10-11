import Database from 'better-sqlite3';

// Database configuration
const dbPath = process.env.DB_PATH || './precast.db';
console.log('DbPath used:', dbPath, 'cwd:', process.cwd());
const db = new Database(dbPath);

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
        started_at BIGINT,
        ended_at BIGINT,
        booking_id TEXT,
        requester TEXT,
        phone TEXT,
        purpose TEXT,
        start_ts BIGINT,
        end_ts BIGINT,
        work_type TEXT,
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
        start_ts BIGINT NOT NULL,
        end_ts BIGINT NOT NULL,
        note TEXT,
        status TEXT CHECK(status IN ('รอการอนุมัติ','อนุมัติ','ปฏิเสธ')) NOT NULL DEFAULT 'รอการอนุมัติ',
        created_at BIGINT NOT NULL
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        crane TEXT NOT NULL,
        piece TEXT NOT NULL,
        start_ts BIGINT,
        end_ts BIGINT,
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
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
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
        created_at BIGINT NOT NULL,
        FOREIGN KEY(crane_id) REFERENCES cranes(id)
      )
    `);

    // Seed cranes only if the table is empty
    const craneCount = db.prepare('SELECT COUNT(*) as c FROM cranes').get() as { c: number };
    if (craneCount.c === 0) {
      console.log('Database init - seeding cranes');
      db.exec(`
        INSERT OR IGNORE INTO cranes(id) VALUES
        ('TC1'), ('TC2'), ('TC3'), ('TC4')
      `);
    }

    // Seed queue if empty
    const queueCount = db.prepare('SELECT COUNT(*) as c FROM queue').get() as { c: number };
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
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
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
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database when module is loaded
initializeDatabase();

// Wrapper to make it compatible with existing code that expects pool.query
const dbWrapper = {
  query: (sql: string, params?: any[]) => {
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      return stmt.all(...params);
    }
    return stmt.all();
  },
  get: (sql: string, ...params: any[]) => {
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      return stmt.get(...params);
    }
    return stmt.get();
  },
  run: (sql: string, ...params: any[]) => {
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      return stmt.run(...params);
    }
    return stmt.run();
  },
  transaction: (fn: (...args: any[]) => any) => {
    return db.transaction(fn);
  }
};

export default dbWrapper;
