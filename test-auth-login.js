const http = require('http');

const loginOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify({
      username: 'admin',
      password: 'admin123'
    }))
  }
};

console.log('Testing login endpoint...');

const req = http.request(loginOptions, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log('Response:', chunk.toString());
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.write(JSON.stringify({
  username: 'admin',
  password: 'admin123'
}));

req.end();
