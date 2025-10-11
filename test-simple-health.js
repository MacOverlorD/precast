const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log('Response:', chunk.toString());
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.end();
