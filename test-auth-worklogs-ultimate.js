const http = require('http');

const loginAndTestWorkLogs = () => {
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
            console.log('Login successful, testing work-logs/ultimate endpoint...');

            // Now test work-logs/ultimate endpoint with token
            const workLogsOptions = {
              hostname: 'localhost',
              port: 4000,
              path: '/api/work-logs/ultimate',
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${loginResponse.token}`
              }
            };

            const workLogsReq = http.request(workLogsOptions, (workLogsRes) => {
              console.log(`Work Logs Ultimate Status: ${workLogsRes.statusCode}`);
              console.log(`Work Logs Ultimate Headers: ${JSON.stringify(workLogsRes.headers)}`);

              let workLogsBody = '';
              workLogsRes.on('data', (chunk) => {
                workLogsBody += chunk;
              });
              workLogsRes.on('end', () => {
                const response = workLogsBody;
                try {
                  const parsed = JSON.parse(response);
                  console.log('Work Logs Ultimate Response: Found', parsed.length, 'logs');
                  console.log('Sample log:', parsed[0] ? JSON.stringify(parsed[0], null, 2).substring(0, 200) + '...' : 'No logs');
                } catch (e) {
                  console.log('Work Logs Ultimate Response (raw):', response.substring(0, 200) + '...');
                }
                resolve(workLogsBody);
              });
            });

            workLogsReq.on('error', (e) => {
              console.error(`Problem with work logs request: ${e.message}`);
              reject(e);
            });

            workLogsReq.end();
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

loginAndTestWorkLogs()
  .then(() => {
    console.log('Work logs ultimate test completed successfully');
  })
  .catch((error) => {
    console.error('Work logs ultimate test failed:', error);
    process.exit(1);
  });
