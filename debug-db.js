const Database = require('better-sqlite3');
const db = new Database('./precast-api/precast.db');

console.log('=== Checking Bookings Table ===');
const bookings = db.prepare('SELECT * FROM bookings').all();
console.log('Raw bookings data:', JSON.stringify(bookings, null, 2));

console.log('\n=== Checking Database Schema ===');
const schema = db.prepare("PRAGMA table_info(bookings)").all();
console.log('Bookings schema:', schema);

console.log('\n=== Checking Other Tables ===');
const cranes = db.prepare('SELECT * FROM cranes').all();
console.log('Cranes:', cranes);

const queue = db.prepare('SELECT * FROM queue').all();
console.log('Queue:', queue);

const workLogs = db.prepare('SELECT * FROM work_logs').all();
console.log('Work Logs:', workLogs);

const users = db.prepare('SELECT * FROM users').all();
console.log('Users:', users);

db.close();
