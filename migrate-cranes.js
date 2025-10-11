const Database = require('better-sqlite3');
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'precast-api', 'precast.db');
const db = new Database(dbPath);

// Function to normalize crane ID
const normalizeCraneId = (craneId) => {
  const normalized = craneId.trim().toUpperCase();
  // Convert "CRANE 1" -> "TC1", "TC1" -> "TC1", etc.
  const match = normalized.match(/(?:CRANE\s*|TC\s*)(\d+)/);
  if (match) {
    return `TC${match[1]}`;
  }
  return normalized;
};

console.log('Starting crane ID normalization...');

// 1. Update work logs
const workLogs = db.prepare('SELECT id, crane_id FROM work_logs').all();
console.log(`Found ${workLogs.length} work logs`);

let updated = 0;
for (const log of workLogs) {
  const normalized = normalizeCraneId(log.crane_id);
  if (normalized !== log.crane_id) {
    db.prepare('UPDATE work_logs SET crane_id = ? WHERE id = ?').run(normalized, log.id);
    console.log(`Updated work log ${log.id}: ${log.crane_id} -> ${normalized}`);
    updated++;
  }
}

// 2. Update queue items (if needed)
const queueItems = db.prepare('SELECT crane_id, ord FROM queue').all();
console.log(`Found ${queueItems.length} queue items`);

for (const item of queueItems) {
  const normalized = normalizeCraneId(item.crane_id);
  if (normalized !== item.crane_id) {
    console.log(`Queue item ${item.crane_id}:${item.ord} uses inconsistent ID: ${item.crane_id}`);
  }
}

// 3. Update bookings (if needed)
const bookings = db.prepare('SELECT id, crane FROM bookings').all();
console.log(`Found ${bookings.length} bookings`);

for (const booking of bookings) {
  const normalized = normalizeCraneId(booking.crane);
  if (normalized !== booking.crane) {
    db.prepare('UPDATE bookings SET crane = ? WHERE id = ?').run(normalized, booking.id);
    console.log(`Updated booking ${booking.id}: ${booking.crane} -> ${normalized}`);
  }
}

console.log(`Migration completed: ${updated} work logs updated`);
db.close();
