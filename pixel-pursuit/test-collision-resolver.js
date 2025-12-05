// Node.js test runner for CollisionResolver
const fs = require('fs');
const path = require('path');

// Load the collision resolver code
const collisionResolverCode = fs.readFileSync(path.join(__dirname, 'public', 'collision-resolver.js'), 'utf8');
const testCode = fs.readFileSync(path.join(__dirname, 'public', 'tests', 'collision-resolver.test.js'), 'utf8');

// Create a global environment similar to browser
global.window = global;
global.console = console;
global.performance = require('perf_hooks').performance;

// Execute the collision resolver code
eval(collisionResolverCode);

// Execute the test code
eval(testCode);

// Run the tests
console.log('Running CollisionResolver tests in Node.js environment...\n');

try {
  const results = runCollisionResolverTests();
  
  console.log('\n=== Final Test Results ===');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.details.filter(d => d.status === 'FAIL').forEach(d => {
      console.log(`- ${d.name}: ${d.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}