const Database = require('better-sqlite3');
const path = require('path');

// Try the path that db.ts uses
const dbPath = process.env.DB_PATH || './precast.db';
const db = new Database(path.join(__dirname, 'precast-api', dbPath));

console.log('DB path used:', path.join(__dirname, 'precast-api', dbPath));

// Check current cranes
const currentCranes = db.prepare('SELECT id FROM cranes').all();
console.log('Current cranes in DB:', currentCranes);

// Check queue
const queue = db.prepare('SELECT * FROM queue').all();
console.log('Queue:', queue);

db.close();
