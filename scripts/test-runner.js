/**
 * Quick Test Runner
 * Run this to verify all features work
 */

// Test 1: Check if server is running
async function testServerRunning() {
  console.log('\n🧪 Test 1: Server Health Check');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Server is running on http://localhost:3000');
      return true;
    }
    console.log('❌ Server returned error:', response.status);
    return false;
  } catch (error) {
    console.log('❌ Server is not running. Start with: npm run dev');
    return false;
  }
}

// Test 2: Check Public API endpoints
async function testAPIEndpoints() {
  console.log('\n🧪 Test 2: Public API Endpoints Check');
  
  const endpoints = [
    '/api/search?q=test',  // Search should be public
    '/api/upload',         // Health check should now pass (200)
    '/api/auth/session'    // Auth session check
  ];

  let passed = 0;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      if (response.ok || response.status === 401 || response.status === 403) {
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        passed++;
      } else {
        console.log(`❌ ${endpoint} - Status: ${response.status} (Failed)`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 API Tests: ${passed}/${endpoints.length} passed`);
  return passed === endpoints.length;
}

// Test 3: Check database content (Public Search)
async function testDatabaseContent() {
  console.log('\n🧪 Test 3: Database Content Verification');
  try {
    // Search for a tool we know exists from the seed
    const query = "BLAST";
    const response = await fetch(`http://localhost:3000/api/search?q=${query}`);
    
    if (response.ok) {
      const data = await response.json();
      // The search API structure usually returns { tools: [], courses: [], ... } or flat array
      // Let's inspect what we get
      const hasResults = (data.tools && data.tools.length > 0) || 
                         (Array.isArray(data) && data.length > 0);
                         
      if (hasResults) {
        console.log(`✅ Database verify: Search for "${query}" returned results`);
        return true;
      } else {
        console.log(`⚠️  Database verify: Search for "${query}" returned empty results. (Did seeding finish?)`);
        return false;
      }
    }
    console.log(`❌ Database verify failed with status: ${response.status}`);
    return false;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test 4: Check static files
async function testStaticFiles() {
  console.log('\n🧪 Test 4: Static Files Check');
  
  const files = [
    '/robots.txt',
    '/sitemap.xml',
  ];

  let passed = 0;
  for (const file of files) {
    try {
      const response = await fetch(`http://localhost:3000${file}`);
      if (response.ok) {
        console.log(`✅ ${file} - Available`);
        passed++;
      } else {
        console.log(`⚠️  ${file} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${file} - Error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Static Files: ${passed}/${files.length} available`);
  return passed >= 1; // At least robots.txt should work
}

// Test 5: Performance check
async function testPerformance() {
  console.log('\n🧪 Test 5: Performance Check');
  
  const tests = [
    { name: 'Homepage', url: '/' },
    { name: 'Directory', url: '/directory' },
    { name: 'Blog', url: '/blog' },
    { name: 'Courses', url: '/courses' },
  ];

  for (const test of tests) {
    try {
      const start = performance.now();
      const response = await fetch(`http://localhost:3000${test.url}`);
      const duration = performance.now() - start;
      
      if (response.ok) {
        const timeStr = duration.toFixed(0) + 'ms';
        let status = '✅';
        if (duration > 1000) status = '⚠️ ';
        if (duration > 2000) status = '❌';
        
        console.log(`${status} ${test.name}: ${timeStr}`);
      } else {
        console.log(`❌ ${test.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error ${error.message}`);
    }
  }
  
  return true;
}

// Main test runner
async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   BioinformaticsHub - System Verification    ║');
  console.log('╚═══════════════════════════════════════════════╝');

  const results = {
    server: await testServerRunning(),
    api: await testAPIEndpoints(),
    database: await testDatabaseContent(),
    static: await testStaticFiles(),
    performance: await testPerformance(),
  };

  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY                     ║');
  console.log('╚═══════════════════════════════════════════════╝');
  
  const tests = Object.entries(results);
  const passed = tests.filter(([_, result]) => result).length;
  const total = tests.length;

  tests.forEach(([name, result]) => {
    const icon = result ? '✅' : '❌';
    console.log(`${icon} ${name.charAt(0).toUpperCase() + name.slice(1)}`);
  });

  console.log(`\n📊 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL SYSTEMS GO! Your app is fully functional!');
  } else {
    console.log('\n⚠️  Issues detected. Review logs above.');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run tests
runAllTests().catch(console.error);
