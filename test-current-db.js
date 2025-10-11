const Database = require('better-sqlite3');
const path = require('path');

const dbPath = './precast.db';
const cwd = process.cwd();
console.log('Testing from cwd:', cwd);
console.log('Server DB path:', dbPath);
console.log('Full path:', path.join(cwd, 'precast-api', dbPath));

const db = new Database(path.join(cwd, 'precast-api', dbPath));

// Check current cranes
const currentCranes = db.prepare('SELECT id FROM cranes').all();
console.log('Current cranes in server DB:', currentCranes);

// Check queue
const queue = db.prepare('SELECT crane_id, ord, piece, status FROM queue LIMIT 10').all();
console.log('Queue items:', queue);

db.close();
