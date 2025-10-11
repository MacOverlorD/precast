const db = require('./src/db').default;

db.run('ALTER TABLE queue ADD COLUMN booking_id TEXT');

console.log('Added booking_id column to queue table');
