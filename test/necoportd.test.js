import { test } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAEMON_PATH = path.join(__dirname, '..', 'bin', 'necoportd');
const CLIENT_PATH = path.join(__dirname, '..', 'bin', 'necoport-client');
const TEST_PORT = 5556; // Use different port for tests

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

test('necoportd daemon lifecycle', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  let stdout = '';
  daemon.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  
  try {
    // Wait for daemon to start
    await waitForPort(TEST_PORT);
    
    // Check startup output
    assert(stdout.includes('Neco Porter starting...'), 'Should show startup message');
    assert(stdout.includes(`necoportd ready on :${TEST_PORT}`), 'Should show ready message');
    
    // Test HTTP endpoint
    const response = await fetch(`http://localhost:${TEST_PORT}/list`);
    assert.strictEqual(response.status, 200, 'Should respond to /list');
    
    const data = await response.json();
    assert(Array.isArray(data), 'Should return array');
  } finally {
    daemon.kill();
  }
});

test('port reservation and release', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Reserve a port
    const reserveResponse = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test-service', hint: 3001 })
    });
    
    assert.strictEqual(reserveResponse.status, 200, 'Should reserve successfully');
    const reserveData = await reserveResponse.json();
    assert(reserveData.port >= 3000 && reserveData.port <= 3999, 'Port should be in range');
    
    // List ports
    const listResponse = await fetch(`http://localhost:${TEST_PORT}/list`);
    const listData = await listResponse.json();
    assert.strictEqual(listData.length, 1, 'Should have one reservation');
    assert.strictEqual(listData[0].name, 'test-service', 'Should have correct name');
    
    // Release port
    const releaseResponse = await fetch(`http://localhost:${TEST_PORT}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test-service' })
    });
    
    assert.strictEqual(releaseResponse.status, 204, 'Should release successfully');
    
    // Verify released
    const listResponse2 = await fetch(`http://localhost:${TEST_PORT}/list`);
    const listData2 = await listResponse2.json();
    assert.strictEqual(listData2.length, 0, 'Should have no reservations');
  } finally {
    daemon.kill();
  }
});

test('duplicate reservation handling', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // First reservation
    const response1 = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'duplicate-test', pid: process.pid })
    });
    
    const data1 = await response1.json();
    const port1 = data1.port;
    
    // Try to reserve again with same name
    const response2 = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'duplicate-test', pid: process.pid })
    });
    
    const data2 = await response2.json();
    const port2 = data2.port;
    
    assert.strictEqual(port1, port2, 'Should return same port for same service');
  } finally {
    daemon.kill();
  }
});

test('heartbeat extends lease', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Reserve with short lease
    await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'heartbeat-test', lease: 1 })
    });
    
    // Send heartbeat
    const heartbeatResponse = await fetch(`http://localhost:${TEST_PORT}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'heartbeat-test' })
    });
    
    assert.strictEqual(heartbeatResponse.status, 204, 'Heartbeat should succeed');
  } finally {
    daemon.kill();
  }
});

test('error handling', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Missing name
    const response = await fetch(`http://localhost:${TEST_PORT}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    assert.strictEqual(response.status, 400, 'Should return 400 for missing name');
    const data = await response.json();
    assert(data.error, 'Should include error message');
    assert(data.cat, 'Should include cat emoji');
  } finally {
    daemon.kill();
  }
});