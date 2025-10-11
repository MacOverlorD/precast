// Test the work-logs router directly
try {
  const workLogs = require('./precast-api/src/routes/work-logs');
  console.log('workLogs loaded successfully:', typeof workLogs);
  console.log('workLogs methods:', Object.keys(workLogs));
} catch (error) {
  console.error('Error loading workLogs:', error);
}
