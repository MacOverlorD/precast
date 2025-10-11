const http = require('http');

// Test migration endpoint
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/work-logs/migrate',
  method: 'PUT'
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

    // Now test GET work logs to see if they were updated
    console.log('\n=== Testing GET work logs ===');
    const getOptions = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/work-logs',
      method: 'GET'
    };

    const getReq = http.request(getOptions, (res) => {
      let getBody = '';
      res.on('data', (chunk) => {
        getBody += chunk;
      });
      res.on('end', () => {
        console.log('Updated work logs:', getBody);
      });
    });

    getReq.on('error', (e) => {
      console.error('GET error:', e.message);
    });
    getReq.end();
  });
});

req.on('error', (e) => {
  console.error(`Migration error: ${e.message}`);
});

req.end();
