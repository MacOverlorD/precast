const Database = require('better-sqlite3');

const db = new Database('./precast.db');

console.log('Cranes:', db.prepare('SELECT id FROM cranes').all());

db.close();
