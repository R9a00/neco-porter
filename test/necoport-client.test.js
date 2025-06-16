import { test } from 'node:test';
import assert from 'node:assert';
import { spawn, exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';
import net from 'node:net';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DAEMON_PATH = path.join(__dirname, '..', 'bin', 'necoportd');
const CLIENT_PATH = path.join(__dirname, '..', 'bin', 'necoport-client');
const TEST_PORT = 5557;

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

test('necoport-client help', async (t) => {
  const { stdout } = await execAsync(`${CLIENT_PATH} --help`);
  
  assert(stdout.includes('Neco Porter'), 'Should show title');
  assert(stdout.includes('Commands:'), 'Should show commands');
  assert(stdout.includes('exec'), 'Should show exec command');
  assert(stdout.includes('list'), 'Should show list command');
});

test('necoport-client list with daemon', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    const { stdout } = await execAsync(`NECOPORTD_URL=http://localhost:${TEST_PORT} ${CLIENT_PATH} list`);
    assert(stdout.includes('Active ports:') || stdout.includes('No ports reserved'), 'Should show port status');
  } finally {
    daemon.kill();
  }
});

test('necoport-client reserve and release', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Reserve a port
    const { stdout: reserveOut } = await execAsync(
      `NECOPORTD_URL=http://localhost:${TEST_PORT} ${CLIENT_PATH} reserve test-cli`
    );
    
    // Check for port number in output
    const portMatch = reserveOut.match(/\d{4}/);
    assert(portMatch, 'Should output port number');
    
    // List to verify
    const { stdout: listOut } = await execAsync(
      `NECOPORTD_URL=http://localhost:${TEST_PORT} ${CLIENT_PATH} list`
    );
    assert(listOut.includes('test-cli'), 'Should show reserved service');
    
    // Release the port
    const { stdout: releaseOut } = await execAsync(
      `NECOPORTD_URL=http://localhost:${TEST_PORT} ${CLIENT_PATH} release test-cli`
    );
    assert(releaseOut.includes('released'), 'Should confirm release');
  } finally {
    daemon.kill();
  }
});

test('necoport-client exec command', async (t) => {
  const env = { ...process.env, NECOPORTD_PORT: TEST_PORT };
  const daemon = spawn(DAEMON_PATH, [], { env });
  
  try {
    await waitForPort(TEST_PORT);
    
    // Use exec to run a simple command that uses PORT
    const clientEnv = { 
      ...process.env, 
      NECOPORTD_URL: `http://localhost:${TEST_PORT}` 
    };
    
    const client = spawn(CLIENT_PATH, ['exec', 'test-exec', 'node', '-e', 'console.log(`PORT=${process.env.PORT}`)'], {
      env: clientEnv
    });
    
    let output = '';
    client.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    await new Promise((resolve) => {
      client.on('exit', resolve);
    });
    
    assert(output.includes('PORT='), 'Should set PORT environment variable');
    assert(output.includes('GET!'), 'Should show cat celebration');
  } finally {
    daemon.kill();
  }
});

test('necoport-client fallback when daemon not running', async (t) => {
  // Test without daemon running
  const { stdout, stderr } = await execAsync(
    `NECOPORTD_URL=http://localhost:9999 ${CLIENT_PATH} list`
  );
  
  assert(stdout.includes('No ports reserved') || stdout.includes('not running'), 
    'Should handle daemon not running gracefully');
});

test('necoport-client error handling', async (t) => {
  try {
    await execAsync(`${CLIENT_PATH} invalid-command`);
    assert.fail('Should have failed with invalid command');
  } catch (error) {
    assert(error.stderr.includes('Unknown command') || error.stdout.includes('Unknown command'), 'Should show error for unknown command');
  }
  
  try {
    await execAsync(`${CLIENT_PATH} exec`);
    assert.fail('Should have failed with missing args');
  } catch (error) {
    assert(error.stderr.includes('Usage') || error.stdout.includes('Usage'), 'Should show usage for missing args');
  }
});