import { test } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAEMON_PATH = path.join(__dirname, '..', 'src', 'necoportd-v2.js');
const TEST_PORT = 5559; // Different from other tests

async function waitForPort(port, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const connection = await new Promise((resolve, reject) => {
        const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
          client.end();
          resolve(true);
        });
        client.on('error', reject);
      });
      if (connection) return true;
    } catch {
      await setTimeout(100);
    }
  }
  throw new Error(`Port ${port} not ready after ${timeout}ms`);
}

test('v2 multi-port reservation', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Reserve multiple named ports
    const response = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test-multi',
        ports: {
          main: { hint: 3100 },
          api: { hint: 3101 },
          websocket: { hint: 3102 }
        }
      })
    });
    
    assert.strictEqual(response.status, 200, 'Should reserve successfully');
    const data = await response.json();
    
    // Check v1 compatibility field
    assert(data.port, 'Should have port field for v1 compatibility');
    
    // Check v2 multi-port response
    assert(data.ports, 'Should have ports object');
    assert(data.ports.main, 'Should have main port');
    assert(data.ports.api, 'Should have api port');
    assert(data.ports.websocket, 'Should have websocket port');
    
    // Verify all ports are different
    const portValues = Object.values(data.ports);
    const uniquePorts = new Set(portValues);
    assert.strictEqual(uniquePorts.size, portValues.length, 'All ports should be unique');
  } finally {
    daemon.kill();
  }
});

test('v2 count-based port reservation', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Reserve by count
    const response = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test-count',
        count: 3
      })
    });
    
    assert.strictEqual(response.status, 200, 'Should reserve successfully');
    const data = await response.json();
    
    assert(data.ports, 'Should have ports object');
    assert.strictEqual(Object.keys(data.ports).length, 3, 'Should have 3 ports');
    assert(data.ports['0'], 'Should have port 0');
    assert(data.ports['1'], 'Should have port 1');
    assert(data.ports['2'], 'Should have port 2');
  } finally {
    daemon.kill();
  }
});

test('v2 backward compatibility', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // v1 style request
    const response = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test-v1-compat',
        hint: 3200
      })
    });
    
    assert.strictEqual(response.status, 200, 'Should work with v1 request');
    const data = await response.json();
    
    assert(data.port, 'Should have single port field');
    assert(data.lease, 'Should have lease field');
    assert(!data.ports || Object.keys(data.ports).length === 1, 'Should not have multi-port response for v1 request');
  } finally {
    daemon.kill();
  }
});

test('v2 port conflict prevention', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Reserve first set of ports
    const response1 = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'app1',
        ports: { main: {}, api: {}, ws: {} }
      })
    });
    
    const data1 = await response1.json();
    const app1Ports = new Set(Object.values(data1.ports));
    
    // Reserve second set of ports
    const response2 = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'app2',
        count: 4
      })
    });
    
    const data2 = await response2.json();
    const app2Ports = new Set(Object.values(data2.ports));
    
    // Verify no conflicts
    for (const port of app2Ports) {
      assert(!app1Ports.has(port), `Port ${port} should not be in both allocations`);
    }
  } finally {
    daemon.kill();
  }
});

test('v2 database migration', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  
  // Create a v1 style state file
  const stateFile = path.join(__dirname, 'test-state-v1.json');
  const fs = await import('fs');
  fs.writeFileSync(stateFile, JSON.stringify({
    'legacy-app': {
      port: 3300,
      pid: 99999,
      expires: Date.now() + 600000
    }
  }));
  
  env.NECOPORT_STATE = stateFile;
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Check that legacy app is still reserved
    const response = await fetch(`http://localhost:${TEST_PORT}/list`);
    const data = await response.json();
    
    const legacyApp = data.find(d => d.name === 'legacy-app');
    assert(legacyApp, 'Should find migrated legacy app');
    assert.strictEqual(legacyApp.port, 3300, 'Should preserve port');
    assert(legacyApp.version === '2.0.0' || legacyApp.ports, 'Should be migrated to v2 format');
  } finally {
    daemon.kill();
    try { fs.unlinkSync(stateFile); } catch {}
  }
});

test('v2 /ports/:name endpoint', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Reserve ports
    await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test-service',
        ports: { web: {}, api: {}, admin: {} }
      })
    });
    
    // Query specific service
    const response = await fetch(`http://localhost:${TEST_PORT}/ports/test-service`);
    assert.strictEqual(response.status, 200, 'Should find service');
    
    const data = await response.json();
    assert.strictEqual(data.name, 'test-service');
    assert(data.ports.web, 'Should have web port');
    assert(data.ports.api, 'Should have api port');
    assert(data.ports.admin, 'Should have admin port');
    
    // Query non-existent service
    const response2 = await fetch(`http://localhost:${TEST_PORT}/ports/not-found`);
    assert.strictEqual(response2.status, 404, 'Should return 404 for unknown service');
  } finally {
    daemon.kill();
  }
});