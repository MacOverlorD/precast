const http = require('http');

const postData = JSON.stringify({
  crane_id: "CRANE 3",
  operator_id: "TEST_OP",
  operator_name: "Test Normalization",
  work_date: "2025-10-08",
  shift: "morning",
  actual_work: "Testing crane ID normalization",
  actual_time: 90,
  status: "ปกติ",
  note: "This should be normalized to TC3"
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/work-logs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
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

    const result = JSON.parse(body);
    console.log(`Created work log with crane_id: "${result.crane_id}"`);
    if (result.crane_id === 'TC3') {
      console.log('✅ Crane ID normalization working correctly!');
    } else {
      console.log('❌ Crane ID normalization failed!');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
