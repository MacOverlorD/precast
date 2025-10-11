const Database = require('better-sqlite3');
const dbPath = './precast.db';
const db = new Database(dbPath);

console.log('Starting duplicate cranes cleanup...');

// First, check current cranes
const currentCranes = db.prepare('SELECT id FROM cranes').all();
console.log('Current cranes:', currentCranes);

// Delete the old 'CRANE X' entries
const deleteStmt = db.prepare('DELETE FROM cranes WHERE id = ?');
let deleted = 0;
for (let i = 1; i <= 3; i++) {
  const result = deleteStmt.run(`CRANE ${i}`);
  deleted += result.changes;
  if (result.changes > 0) {
    console.log(`Deleted crane: CRANE ${i}`);
  }
}
console.log(`Total deleted old crane entries: ${deleted}`);

// Update queue to use normalized names (if any still use CRANE X)
const queueUpdate = db.prepare('UPDATE queue SET crane_id = ? WHERE crane_id = ?');
for (let i = 1; i <= 3; i++) {
  const oldId = `CRANE ${i}`;
  const newId = `TC${i}`;
  const updated = queueUpdate.run(newId, oldId);
  if (updated.changes > 0) {
    console.log(`Updated ${updated.changes} queue items from ${oldId} to ${newId}`);
  }
}

// Add back TC4 if missing
db.exec(`INSERT OR IGNORE INTO cranes(id) VALUES ('TC4')`);

// Final check
const finalCranes = db.prepare('SELECT id FROM cranes').all();
console.log('Final cranes:', finalCranes);

console.log('Cleanup completed!');
db.close();
