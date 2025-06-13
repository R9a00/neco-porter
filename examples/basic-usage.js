// Basic usage example for Neco Porter
import { reserve, release, withPort, list } from '../lib/necoport.js';

console.log(`
  ╱|、
 (˚ˎ 。7   Neco Porter Examples
  |、˜〵   
  じしˍ,)ノ
`);

// Example 1: Simple reservation
async function example1() {
  console.log('\n=== Example 1: Simple Port Reservation ===');
  
  const port = await reserve('my-web-app');
  console.log(`Your app can now use port ${port}`);
  
  // Simulate using the port for 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await release('my-web-app');
}

// Example 2: Using withPort for automatic cleanup
async function example2() {
  console.log('\n=== Example 2: Automatic Cleanup with withPort ===');
  
  await withPort('api-server', async (port) => {
    console.log(`API server starting on port ${port}...`);
    
    // Simulate server running
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('API server work complete!');
    // Port automatically released when this function returns
  });
}

// Example 3: Multiple services
async function example3() {
  console.log('\n=== Example 3: Multiple Services ===');
  
  // Reserve ports for multiple services
  const webPort = await reserve('web');
  const apiPort = await reserve('api');
  const dbPort = await reserve('database', 5432); // With hint
  
  console.log('All services ready!');
  
  // List all active ports
  const ports = await list();
  ports.forEach(p => {
    console.log(`  ${p.cat} ${p.name} on port ${p.port}`);
  });
  
  // Cleanup
  await release('web');
  await release('api');
  await release('database');
}

// Run examples
async function runExamples() {
  try {
    await example1();
    await example2();
    await example3();
    
    console.log('\n(=^･ω･^=) All examples complete!');
  } catch (error) {
    console.error('\n(=；ω；=) Error:', error.message);
    console.log('Make sure necoportd is running!');
  }
}

runExamples();