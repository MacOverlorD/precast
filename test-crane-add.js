const http = require('http');

// Simple HTTP client for testing crane creation with auth
const makeRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ statusCode: res.statusCode, result });
        } catch (e) {
          resolve({ statusCode: res.statusCode, result: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function testCraneCreation() {
  try {
    console.log('Testing crane creation with authentication...');

    // Login first
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5177,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin123' });

    if (loginResponse.statusCode !== 200) {
      throw new Error(`Login failed: ${loginResponse.statusCode}`);
    }

    const token = loginResponse.result.token;
    console.log('✓ Login successful, got token');

    // Test GET cranes without auth (should fail)
    console.log('Testing GET cranes without auth...');
    const getWithoutAuth = await makeRequest({
      hostname: 'localhost',
      port: 5177,
      path: '/api/cranes',
      method: 'GET'
    });
    console.log('GET cranes without auth status:', getWithoutAuth.statusCode);

    // Test POST crane without auth (should fail)
    console.log('Testing POST crane without auth...');
    const postWithoutAuth = await makeRequest({
      hostname: 'localhost',
      port: 5177,
      path: '/api/cranes',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { id: 'TC6' });
    console.log('POST crane without auth status:', postWithoutAuth.statusCode);

    // Test POST crane with auth (should work)
    console.log('Testing POST crane with auth...');
    const postWithAuth = await makeRequest({
      hostname: 'localhost',
      port: 5177,
      path: '/api/cranes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, { id: 'TC6' });

    console.log('POST crane with auth status:', postWithAuth.statusCode);
    if (postWithAuth.statusCode === 201) {
      console.log('✅ Crane creation with auth successful!');
      console.log('Response:', postWithAuth.result);
    } else {
      console.log('❌ Crane creation with auth failed');
      console.log('Response:', postWithAuth.result);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testCraneCreation();
