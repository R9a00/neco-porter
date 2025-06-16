// Multi-port example for Neco Porter v2
import { reserve, release, withPort, list } from '../lib/necoport-v2.js';

console.log(`
  ╱|、
 (˚ˎ 。7   Neco Porter v2 Examples
  |、˜〵   Multi-port support!
  じしˍ,)ノ
`);

// Example 1: Named ports for a web application
async function webAppExample() {
  console.log('\n=== Example 1: Web App with Multiple Services ===');
  
  const ports = await reserve('webapp', {
    ports: {
      frontend: { hint: 3000 },
      api: { hint: 8080 },
      websocket: { hint: 8081 },
      metrics: { hint: 9090 }
    }
  });
  
  console.log('Web application ports:');
  console.log(`  Frontend:  http://localhost:${ports.frontend}`);
  console.log(`  API:       http://localhost:${ports.api}`);
  console.log(`  WebSocket: ws://localhost:${ports.websocket}`);
  console.log(`  Metrics:   http://localhost:${ports.metrics}/metrics`);
  
  // Simulate using the ports
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await release('webapp');
  console.log('✓ All ports released');
}

// Example 2: Count-based allocation
async function countBasedExample() {
  console.log('\n=== Example 2: Reserve Multiple Ports by Count ===');
  
  const ports = await reserve('microservices', { count: 5 });
  
  console.log('Microservices ports:');
  Object.entries(ports).forEach(([index, port]) => {
    console.log(`  Service ${index}: ${port}`);
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await release('microservices');
  console.log('✓ All ports released');
}

// Example 3: Using withPort for automatic cleanup
async function withPortExample() {
  console.log('\n=== Example 3: Automatic Cleanup with withPort ===');
  
  await withPort('fullstack', async (ports) => {
    console.log('Full-stack application:');
    console.log(`  Frontend:  ${ports.frontend}`);
    console.log(`  Backend:   ${ports.backend}`);
    console.log(`  Database:  ${ports.database}`);
    console.log(`  Redis:     ${ports.redis}`);
    
    // Simulate server running
    console.log('\nServers running... (simulated for 3 seconds)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Shutting down...');
  }, {
    ports: {
      frontend: { hint: 3000 },
      backend: { hint: 4000 },
      database: { hint: 5432 },
      redis: { hint: 6379 }
    }
  });
  
  console.log('✓ All ports automatically released');
}

// Example 4: Concurrent applications
async function concurrentAppsExample() {
  console.log('\n=== Example 4: Multiple Apps Running Concurrently ===');
  
  // Start multiple apps
  const [app1Ports, app2Ports, app3Ports] = await Promise.all([
    reserve('app1', { ports: { web: {}, api: {} } }),
    reserve('app2', { ports: { main: {}, admin: {}, metrics: {} } }),
    reserve('app3', { count: 2 })
  ]);
  
  console.log('App 1 ports:', app1Ports);
  console.log('App 2 ports:', app2Ports);
  console.log('App 3 ports:', app3Ports);
  
  // List all active ports
  console.log('\nAll active reservations:');
  const allPorts = await list();
  allPorts.forEach(reservation => {
    console.log(`\n${reservation.cat} ${reservation.name}:`);
    if (reservation.ports) {
      Object.entries(reservation.ports).forEach(([name, port]) => {
        console.log(`    ${name}: ${port}`);
      });
    }
  });
  
  // Cleanup
  await Promise.all([
    release('app1'),
    release('app2'),
    release('app3')
  ]);
  console.log('\n✓ All apps released');
}

// Example 5: Migration from v1 to v2
async function migrationExample() {
  console.log('\n=== Example 5: v1 to v2 Migration ===');
  
  // v1 style (still works!)
  console.log('v1 style (single port):');
  const singlePort = await reserve('legacy-app');
  console.log(`  Port: ${singlePort}`);
  await release('legacy-app');
  
  // v2 style (new features)
  console.log('\nv2 style (multi-port):');
  const multiPorts = await reserve('modern-app', {
    ports: {
      main: { hint: singlePort }, // Reuse the same port
      api: {},
      ws: {}
    }
  });
  console.log('  Ports:', multiPorts);
  await release('modern-app');
  
  console.log('✓ Both styles work perfectly!');
}

// Run all examples
async function runExamples() {
  try {
    await webAppExample();
    await countBasedExample();
    await withPortExample();
    await concurrentAppsExample();
    await migrationExample();
    
    console.log('\n(=^･ω･^=) All v2 examples completed successfully!');
    console.log('\nNote: Make sure necoportd v2 is running for these examples.');
  } catch (error) {
    console.error('\n(=；ω；=) Error:', error.message);
    console.log('Make sure necoportd v2 is running:');
    console.log('  ./src/necoportd-v2.js');
  }
}

runExamples();