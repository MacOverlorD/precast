const http = require('http');

console.log('Testing server restart...');

const getOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/cranes',
  method: 'GET'
};

const req = http.request(getOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('API Response:', body);

    // Parse and count cranes
    try {
      const data = JSON.parse(body);
      console.log('Cranes count:', data.length);
      const ids = data.map(c => c.id);
      console.log('Crane IDs:', ids);
    } catch (e) {
      console.log('Parse error:', e);
    }
  });
});

req.on('error', (e) => {
  console.error('API request error:', e.message);
});
req.end();
