const http = require('http');

const postData = JSON.stringify({
  crane_id: "TC1",
  operator_id: "OP1",
  operator_name: "Test Operator",
  work_date: "2024-01-01",
  shift: "morning",
  actual_work: "Test work",
  actual_time: 60,
  status: "ปกติ"
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/work-logs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'x-role': 'admin'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);

  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Response body:', body);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
