

const Database = require('better-sqlite3');
const path = require('path');

// Database connection
const dbPath = process.env.DB_PATH || './precast.db';
const db = new Database(path.join(__dirname, 'precast-api', dbPath));

console.log('DB path used:', path.join(__dirname, 'precast-api', dbPath));

function generateRandomWorkLog(craneId, index) {
  const now = Date.now();
  const baseTime = now - (index * 3600000 * 24); // Spread over days

  const statuses = ['pending', 'working', 'stopped', 'success'];
  const shifts = ['morning', 'afternoon', 'night'];

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const shift = shifts[Math.floor(Math.random() * shifts.length)];

  // Set timestamps based on status
  let started_at = undefined;
  let ended_at = undefined;

  if (status === 'working') {
    started_at = baseTime + (Math.floor(Math.random() * 3600000)); // Started within last hour
  } else if (status === 'stopped' || status === 'success') {
    started_at = baseTime + (Math.floor(Math.random() * 7200000)); // Started 1-2 hours ago
    ended_at = started_at + (Math.floor(Math.random() * 7200000) + 1800000); // Duration 30min-2hours
  }

  // Simulate queue items - only queue have these timestamps, convert to work log format
  const piece = `P${craneId.split('TC')[1] || '1'}-${index + 1}`;
  const operator_name = `Operator ${index + 1}`;
  const operator_id = `EMP${String(index + 1).padStart(3, '0')}`;
  const work_date = new Date(baseTime).toISOString().split('T')[0];

  const work_descriptions = [
    'ยกคอนกรีตระบบหน้าต่างอาคาร A',
    'วางเหล็กโครงสร้างฐานราก',
    'ยกวัสดุก่อสร้างชั้นลอย',
    'ขนส่งวัสดุอุปกรณ์ก่อสร้าง',
    'ติดตั้งระบบครอบหลังคา',
    'ยกน้ำมันเครื่องจักรสำหรับ TC',
    'ขนส่งอุปกรณ์ก่อสร้างเขตงาน',
    'ยกผีเสื้อปั๊มคอนกรีต'
  ];

  const actual_work = work_descriptions[Math.floor(Math.random() * work_descriptions.length)];
  const actual_time = Math.floor(Math.random() * 180) + 30; // 30-210 minutes

  const status_th = {
    pending: 'รอ',
    working: 'กำลังทำงาน',
    stopped: 'หยุดชั่วคราว',
    success: 'เสร็จสิ้น'
  }[status];

  return {
    id: `queue_${craneId}_${index + 1}_${now}`,
    crane_id: craneId,
    ord: index + 1,
    piece,
    note: `${actual_work} (${status_th})`,
    status,
    started_at,
    ended_at,
    operator_name,
    operator_id,
    work_date,
    shift,
    actual_work,
    actual_time,
    status_display: status_th,
    last_updated: now
  };
}

function populateSampleData() {
  console.log('Populating sample queue/work data...');

  const cranes = ['TC1', 'TC2', 'TC3', 'TC4'];
  const totalItemsPerCrane = 3; // Each crane has 3 queue items

  let totalInserted = 0;

  cranes.forEach(craneId => {
    for (let i = 0; i < totalItemsPerCrane; i++) {
      const workLog = generateRandomWorkLog(craneId, i);

      try {
        // Insert or replace queue item
        db.prepare(`
          INSERT OR REPLACE INTO queue (
            crane_id, ord, piece, note, status, started_at, ended_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          workLog.crane_id,
          workLog.ord,
          workLog.piece,
          workLog.note,
          workLog.status,
          workLog.started_at || null,
          workLog.ended_at || null
        );

        console.log(`${workLog.crane_id} - ${workLog.piece}: ${workLog.status} (${workLog.started_at ? new Date(workLog.started_at).toLocaleTimeString() : 'no time'}${workLog.ended_at ? ' - ' + new Date(workLog.ended_at).toLocaleTimeString() : ''})`);
        totalInserted++;

        // For working items, simulate they're active by updating started_at to be recent
        if (workLog.status === 'working') {
          const recentStart = Date.now() - (Math.random() * 1800000); // Within last 30 minutes
          db.prepare(`UPDATE queue SET started_at = ? WHERE crane_id = ? AND ord = ?`).run(
            recentStart, workLog.crane_id, workLog.ord);
        }

      } catch (error) {
        console.error(`Error inserting queue item for ${craneId}:`, error.message);
      }
    }
  });

  console.log(`\nTotal queue items inserted: ${totalInserted}`);

  // Also add some work_log entries for the work logging feature
  console.log('\nPopulating sample work log entries...');
  let workLogCount = 0;

  cranes.forEach(craneId => {
    for (let i = 0; i < 5; i++) { // 5 work log entries per crane
      const date = new Date();
      date.setDate(date.getDate() - i); // Spread over past days
      const workDate = date.toISOString().split('T')[0];

      const workLogData = {
        id: `worklog_${craneId}_${i + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        crane_id: craneId,
        operator_id: `EMP${String(i + 1).padStart(3, '0')}`,
        operator_name: `Operator ${i + 1}`,
        work_date: workDate,
        shift: ['morning', 'afternoon', 'night'][Math.floor(Math.random() * 3)],
        actual_work: ['ยกคอนกรีต', 'วางเหล็กโครงสร้าง', 'ยกวัสดุก่อสร้าง', 'ขนส่งอุปกรณ์', 'ติดตั้งระบบครอบ'][Math.floor(Math.random() * 5)],
        actual_time: Math.floor(Math.random() * 180) + 30, // 30-210 นาที
        status: ['ปกติ', 'ล่าช้า', 'เร่งด่วน', 'เสร็จก่อน'][Math.floor(Math.random() * 4)],
        note: Math.random() > 0.7 ? 'หมายเหตุ: งานเสร็จเรียบร้อย' : undefined,
        created_at: Date.now() - (i * 86400000) // Spread over days
      };

      try {
        db.prepare(`
          INSERT OR REPLACE INTO work_logs (
            id, crane_id, operator_id, operator_name, work_date, shift,
            actual_work, actual_time, status, note, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          workLogData.id,
          workLogData.crane_id,
          workLogData.operator_id,
          workLogData.operator_name,
          workLogData.work_date,
          workLogData.shift,
          workLogData.actual_work,
          workLogData.actual_time,
          workLogData.status,
          workLogData.note || null,
          workLogData.created_at
        );

        console.log(`${workLogData.crane_id} - ${workLogData.work_date} ${workLogData.shift}: ${workLogData.actual_work} (${workLogData.actual_time}นาที) - ${workLogData.status}`);
        workLogCount++;

      } catch (error) {
        console.error(`Error inserting work log for ${craneId}:`, error.message);
      }
    }
  });

  console.log(`\nTotal work log entries inserted: ${workLogCount}`);
  console.log('\nSample data population complete!');
}

if (require.main === module) {
  try {
    populateSampleData();
  } catch (error) {
    console.error('Error populating data:', error);
  }
}

module.exports = { populateSampleData };
