const fs = require('fs');
const path = require('path');

// Delete both database files
const rootDbPath = './precast.db';
const apiDbPath = './precast-api/precast.db';

console.log('Deleting database files...');

if (fs.existsSync(rootDbPath)) {
  fs.unlinkSync(rootDbPath);
  console.log('Deleted root precast.db');
}

if (fs.existsSync(apiDbPath)) {
  fs.unlinkSync(apiDbPath);
  console.log('Deleted API precast.db');
}

console.log('Database files deleted. Server will re-initialize on next restart.');
