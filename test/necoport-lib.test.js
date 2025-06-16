import { test } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

// Import the library
import { reserve, release, list, withPort } from '../lib/necoport.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAEMON_PATH = path.join(__dirname, '..', 'bin', 'necoportd');
const TEST_PORT = 5558;

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

test('library reserve and release', async (t) => {
  const env = { 
    ...process.env, 
    NECOPORTD_PORT: TEST_PORT,
    NECOPORTD_URL: `http://localhost:${TEST_PORT}`
  };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Reserve a port
    const port = await reserve('lib-test');
    assert(typeof port === 'number', 'Should return a number');
    assert(port >= 3000 && port <= 3999, 'Port should be in default range');
    
    // List ports
    const ports = await list();
    assert(Array.isArray(ports), 'List should return array');
    assert(ports.some(p => p.name === 'lib-test'), 'Should include reserved port');
    
    // Release port
    await release('lib-test');
    
    // Verify released
    const portsAfter = await list();
    assert(!portsAfter.some(p => p.name === 'lib-test'), 'Port should be released');
  } finally {
    daemon.kill();
  }
});

test('library withPort helper', async (t) => {
  const env = { 
    ...process.env, 
    NECOPORTD_PORT: TEST_PORT,
    NECOPORTD_URL: `http://localhost:${TEST_PORT}`
  };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    let capturedPort;
    let wasInList = false;
    
    await withPort('with-port-test', async (port) => {
      capturedPort = port;
      assert(typeof port === 'number', 'Should provide port number');
      
      // Check if port is reserved during callback
      const ports = await list();
      wasInList = ports.some(p => p.name === 'with-port-test');
    });
    
    assert(capturedPort >= 3000 && capturedPort <= 3999, 'Port should be in range');
    assert(wasInList, 'Port should be reserved during callback');
    
    // Verify port is released after callback
    const portsAfter = await list();
    assert(!portsAfter.some(p => p.name === 'with-port-test'), 'Port should be released after callback');
  } finally {
    daemon.kill();
  }
});

test('library error handling', async (t) => {
  const env = { 
    ...process.env, 
    NECOPORTD_PORT: TEST_PORT,
    NECOPORTD_URL: `http://localhost:${TEST_PORT}`
  };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Test withPort error propagation
    let errorThrown = false;
    try {
      await withPort('error-test', async (port) => {
        throw new Error('Test error');
      });
    } catch (error) {
      errorThrown = true;
      assert.strictEqual(error.message, 'Test error', 'Should propagate error');
    }
    assert(errorThrown, 'Should have thrown error');
    
    // Verify port was still released
    const ports = await list();
    assert(!ports.some(p => p.name === 'error-test'), 'Port should be released even after error');
  } finally {
    daemon.kill();
  }
});

test('library fallback behavior', async (t) => {
  // Test without daemon running
  process.env.NECOPORTD_URL = 'http://localhost:9999';
  
  // Should fallback to OS assignment
  const port = await reserve('fallback-test');
  assert.strictEqual(port, 0, 'Should return 0 for OS assignment when daemon not available');
  
  // List should return empty array
  const ports = await list();
  assert(Array.isArray(ports), 'Should return array');
  assert.strictEqual(ports.length, 0, 'Should return empty array when daemon not available');
  
  // Release should not throw
  await assert.doesNotReject(async () => {
    await release('fallback-test');
  }, 'Release should not throw when daemon not available');
});