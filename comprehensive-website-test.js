const http = require('http');

// Comprehensive test script to verify all website features
class Tester {
  constructor() {
    this.token = null;
    this.baseUrl = 'http://localhost:4000';
  }

  makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const reqOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      // Add auth header unless explicitly disabled (for public endpoints)
      if (this.token && !options.unauthorized) {
        reqOptions.headers.Authorization = `Bearer ${this.token}`;
      }

      const req = http.request(reqOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const result = { status: res.statusCode, body: JSON.parse(body) };
            resolve(result);
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      });

      req.on('error', (e) => reject(e));

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async login() {
    console.log('🔐 Testing login...');

    return new Promise((resolve, reject) => {
      // Use exact same format as working test-auth-login.js
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
              console.log('✅ Login successful, received token');
              this.token = loginResponse.token;
              resolve(true);
            } else {
              console.log('❌ Login failed:', loginResponse);
              resolve(false);
            }
          } catch (parseError) {
            console.error('Error parsing login response:', parseError);
            resolve(false);
          }
        });
      });

      loginReq.on('error', (e) => {
        console.error(`Problem with login request: ${e.message}`);
        resolve(false);
      });

      loginReq.write(loginData);
      loginReq.end();
    });
  }

  async testHealth() {
    console.log('🏥 Testing health endpoint...');
    console.log('Making request to:', this.baseUrl + '/api/health');
    const result = await this.makeRequest('/api/health', {
      method: 'GET',
      unauthorized: true // Explicitly no auth for public endpoint
    });

    console.log('Health result status:', result.status);
    console.log('Health result body:', JSON.stringify(result.body, null, 2));
    if (result.status === 200 && result.body.ok === true) {
      console.log('✅ Health endpoint working');
      return true;
    } else {
      console.log('❌ Health endpoint failed');
      return false;
    }
  }

  async testCranes() {
    console.log('🚠 Testing cranes endpoint...');
    const result = await this.makeRequest('/api/cranes');

    if (result.status === 200 && Array.isArray(result.body)) {
      const cranes = result.body;
      console.log(`✅ Cranes endpoint working, found ${cranes.length} cranes`);
      console.log(`Available cranes: ${cranes.map(c => c.id).join(', ')}`);
      return cranes;
    } else {
      console.log('❌ Cranes endpoint failed');
      return null;
    }
  }

  async testBookings(cranes) {
    console.log('📅 Testing bookings endpoint...');
    const result = await this.makeRequest('/api/bookings');

    if (result.status === 200 && Array.isArray(result.body)) {
      console.log(`✅ Bookings endpoint working, found ${result.body.length} bookings`);
      return result.body;
    } else {
      console.log('❌ Bookings endpoint failed');
      return null;
    }
  }

  async testWorkLogs() {
    console.log('📋 Testing work logs endpoints...');

    // Test main work logs
    const mainResult = await this.makeRequest('/api/work-logs');
    let mainWorks = false;
    if (mainResult.status === 200 && Array.isArray(mainResult.body)) {
      console.log(`✅ Main work logs endpoint working, found ${mainResult.body.length} logs`);
      mainWorks = true;
    } else {
      console.log('❌ Main work logs endpoint failed');
    }

    // Test ultimate endpoint
    const ultimateResult = await this.makeRequest('/api/work-logs/ultimate');
    let ultimateWorks = false;
    if (ultimateResult.status === 200 && Array.isArray(ultimateResult.body)) {
      console.log(`✅ Work logs ultimate endpoint working, found ${ultimateResult.body.length} logs`);
      ultimateWorks = true;
    } else {
      console.log('❌ Work logs ultimate endpoint failed');
    }

    // Test endpoint
    const endpointResult = await this.makeRequest('/api/work-logs/endpoint');
    let endpointWorks = false;
    if (endpointResult.status === 200 && Array.isArray(endpointResult.body)) {
      console.log(`✅ Work logs endpoint working, found ${endpointResult.body.length} logs`);
      endpointWorks = true;
    } else {
      console.log('❌ Work logs endpoint failed');
    }

    return mainWorks && ultimateWorks && endpointWorks;
  }

  async testHistory() {
    console.log('📊 Testing history endpoint...');
    const result = await this.makeRequest('/api/history');

    if (result.status === 200 && Array.isArray(result.body)) {
      console.log(`✅ History endpoint working, found ${result.body.length} history records`);
      return true;
    } else {
      console.log('❌ History endpoint failed');
      return false;
    }
  }

  async createWorkLog() {
    console.log('📝 Testing work log creation...');

    const workLogData = {
      crane_id: 'TC1',
      operator_id: 'TEST001',
      operator_name: 'Test Operator',
      work_date: '2025-10-10',
      shift: 'morning',
      actual_work: 'Testing work creation',
      actual_time: 60,
      status: 'ปกติ'
    };

    const result = await this.makeRequest('/api/work-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: workLogData
    });

    if (result.status === 201 && result.body.id) {
      console.log('✅ Work log creation successful');
      return true;
    } else {
      console.log('❌ Work log creation failed:', result.body);
      return false;
    }
  }

  async testProfile() {
    console.log('👤 Testing profile endpoint...');
    const result = await this.makeRequest('/api/auth/profile');

    if (result.status === 200 && result.body.user) {
      console.log('✅ Profile endpoint working, user:', result.body.user.username);
      return true;
    } else {
      console.log('❌ Profile endpoint failed');
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive website test...\n');

    // Test unauthenticated endpoints
    const healthOk = await this.testHealth();

    if (!healthOk) {
      console.log('💥 Basic health check failed, aborting other tests');
      return;
    }

    // Test authentication
    const loginOk = await this.login();

    if (!loginOk) {
      console.log('💥 Login failed, aborting authenticated tests');
      return;
    }

    // Test authenticated endpoints
    const cranes = await this.testCranes();
    const bookings = cranes ? await this.testBookings(cranes) : null;
    const workLogsOk = await this.testWorkLogs();
    const historyOk = await this.testHistory();
    const profileOk = await this.testProfile();

    // Test creating a work log
    const workLogOk = await this.createWorkLog();

    console.log('\n📊 Test Summary:');
    console.log('==============');
    console.log('✅ Health:', healthOk);
    console.log('✅ Login:', loginOk);
    console.log('✅ Cranes:', !!cranes);
    console.log('✅ Bookings:', !!bookings);
    console.log('✅ Work Logs:', workLogsOk);
    console.log('✅ History:', historyOk);
    console.log('✅ Profile:', profileOk);
    console.log('✅ Work Log Creation:', workLogOk);

    const allPassed = healthOk && loginOk && !!cranes && !!bookings && workLogsOk && historyOk && profileOk;
    console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

    if (allPassed) {
      console.log('🎊 Website is fully functional!');
    } else {
      console.log('🔧 Some features need attention');
    }

    return allPassed;
  }
}

// Run the complete test suite
const tester = new Tester();
tester.runAllTests()
  .then(() => {
    console.log('\n🏁 Comprehensive website test completed');
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
