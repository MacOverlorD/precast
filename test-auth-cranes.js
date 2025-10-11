const http = require('http');

const loginAndTestCranes = () => {
  return new Promise((resolve, reject) => {
    // First, login to get token
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginReq = http.request(loginOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const loginResponse = JSON.parse(body);
          if (res.statusCode === 200 && loginResponse.token) {
            console.log('Login successful, testing cranes endpoint...');

            // Now test cranes endpoint with token
            const cranesOptions = {
              hostname: 'localhost',
              port: 4000,
              path: '/api/cranes',
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${loginResponse.token}`
              }
            };

            const cranesReq = http.request(cranesOptions, (cranesRes) => {
              console.log(`Cranes Status: ${cranesRes.statusCode}`);
              console.log(`Cranes Headers: ${JSON.stringify(cranesRes.headers)}`);

              let cranesBody = '';
              cranesRes.on('data', (chunk) => {
                cranesBody += chunk;
              });
              cranesRes.on('end', () => {
                console.log('Cranes Response body:', cranesBody);
                resolve(cranesBody);
              });
            });

            cranesReq.on('error', (e) => {
              console.error(`Problem with cranes request: ${e.message}`);
              reject(e);
            });

            cranesReq.end();
          } else {
            console.error('Login failed:', loginResponse);
            reject(new Error('Login failed'));
          }
        } catch (parseError) {
          console.error('Error parsing login response:', parseError);
          reject(parseError);
        }
      });
    });

    loginReq.on('error', (e) => {
      console.error(`Problem with login request: ${e.message}`);
      reject(e);
    });

    loginReq.write(loginData);
    loginReq.end();
  });
};

loginAndTestCranes()
  .then(() => {
    console.log('Test completed successfully');
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
