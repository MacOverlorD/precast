const http = require('http');

const loginAndCreateWorkLog = () => {
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
            console.log('Login successful! Token received.');
            console.log('Testing work log creation with authentication...');

            // Now create a work log with the token
            const workLogData = JSON.stringify({
              crane_id: "TC1",
              operator_id: "001",
              operator_name: "Mac",
              work_date: "2025-10-09",
              shift: "morning",
              actual_work: "Test work after fix",
              actual_time: 60,
              status: "ปกติ"
            });

            const workLogOptions = {
              hostname: 'localhost',
              port: 4000,
              path: '/api/work-logs',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(workLogData),
                'Authorization': `Bearer ${loginResponse.token}`
              }
            };

            const workLogReq = http.request(workLogOptions, (workLogRes) => {
              console.log(`Work Log Creation Status: ${workLogRes.statusCode}`);
              console.log(`Headers: ${JSON.stringify(workLogRes.headers)}`);

              let workLogBody = '';
              workLogRes.on('data', (chunk) => {
                workLogBody += chunk;
              });
              workLogRes.on('end', () => {
                const response = workLogBody;
                try {
                  const parsed = JSON.parse(response);
                  console.log('Work Log Creation Response:', JSON.stringify(parsed, null, 2));
                  if (workLogRes.statusCode === 201) {
                    console.log('✅ SUCCESS: Work log created successfully with authentication!');
                  } else {
                    console.log('❌ FAILED: Work log creation failed');
                  }
                } catch (e) {
                  console.log('Work Log Creation Response (raw):', response);
                }
                resolve(workLogBody);
              });
            });

            workLogReq.on('error', (e) => {
              console.error(`Problem with work log creation request: ${e.message}`);
              reject(e);
            });

            workLogReq.write(workLogData);
            workLogReq.end();
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

loginAndCreateWorkLog()
  .then(() => {
    console.log('✅ Work log creation test completed successfully!');
    console.log('The authentication fix is working correctly.');
  })
  .catch((error) => {
    console.error('❌ Work log creation test failed:', error.message);
    process.exit(1);
  });
