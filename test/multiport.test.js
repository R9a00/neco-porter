import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import { reserve, release, list } from '../lib/necoport-v2.js';

describe('Multiport Functionality', () => {
  let daemonProcess;
  
  before(async () => {
    // Start daemon for testing
    daemonProcess = spawn('node', ['src/necoportd-v2.js'], {
      stdio: 'pipe'
    });
    
    // Wait for daemon to start
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
  
  after(() => {
    if (daemonProcess) {
      daemonProcess.kill();
    }
  });

  describe('Single Port (v1 compatibility)', () => {
    it('should reserve a single port when no ports specified', async () => {
      const port = await reserve('test-single');
      
      assert(typeof port === 'number', 'Should return a number for single port');
      assert(port >= 3000 && port <= 3999, 'Port should be in configured range');
      
      await release('test-single');
    });
  });

  describe('Multiple Ports (v2 functionality)', () => {
    it('should reserve multiple named ports', async () => {
      const ports = await reserve('test-multi', {
        ports: {
          main: { hint: 8000 },
          api: { hint: 8001 },
          websocket: { hint: 8002 }
        }
      });
      
      // Critical test: Should return an object, not a number
      assert(typeof ports === 'object', 'Should return an object for multiport');
      assert(ports !== null, 'Ports object should not be null');
      assert(!Array.isArray(ports), 'Ports should be an object, not array');
      
      // Should have all requested ports
      assert(ports.main, 'Should have main port');
      assert(ports.api, 'Should have api port');
      assert(ports.websocket, 'Should have websocket port');
      
      // All ports should be numbers in range
      assert(typeof ports.main === 'number', 'Main port should be number');
      assert(typeof ports.api === 'number', 'API port should be number');
      assert(typeof ports.websocket === 'number', 'WebSocket port should be number');
      
      assert(ports.main >= 3000 && ports.main <= 9999, 'Main port in range');
      assert(ports.api >= 3000 && ports.api <= 9999, 'API port in range');
      assert(ports.websocket >= 3000 && ports.websocket <= 9999, 'WebSocket port in range');
      
      // All ports should be different
      assert(ports.main !== ports.api, 'Main and API ports should be different');
      assert(ports.main !== ports.websocket, 'Main and WebSocket ports should be different');
      assert(ports.api !== ports.websocket, 'API and WebSocket ports should be different');
      
      await release('test-multi');
    });

    it('should respect port hints when available', async () => {
      const ports = await reserve('test-hints', {
        ports: {
          main: { hint: 3100 },
          api: { hint: 3101 }
        }
      });
      
      assert(typeof ports === 'object', 'Should return object for multiport');
      
      // Should get hinted ports if available
      assert(ports.main === 3100 || ports.main >= 3000, 'Should use hint or fallback');
      assert(ports.api === 3101 || ports.api >= 3000, 'Should use hint or fallback');
      
      await release('test-hints');
    });

    it('should handle count-based allocation', async () => {
      const ports = await reserve('test-count', { count: 3 });
      
      assert(typeof ports === 'object', 'Should return object for count-based');
      
      const portValues = Object.values(ports);
      assert(portValues.length === 3, 'Should allocate exactly 3 ports');
      
      // All should be unique
      const uniquePorts = new Set(portValues);
      assert(uniquePorts.size === 3, 'All ports should be unique');
      
      await release('test-count');
    });
  });

  describe('State Management', () => {
    it('should store multiport reservations correctly', async () => {
      const ports = await reserve('test-state', {
        ports: {
          main: { hint: 8000 },
          api: { hint: 8001 }
        }
      });
      
      const allReservations = await list();
      const ourReservation = allReservations.find(r => r.name === 'test-state');
      
      assert(ourReservation, 'Should find our reservation in list');
      assert(ourReservation.ports, 'Reservation should have ports object');
      assert(ourReservation.ports.main, 'Should have main port in state');
      assert(ourReservation.ports.api, 'Should have api port in state');
      
      await release('test-state');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should work with expmt-platform-saas config', async () => {
      const ports = await reserve('platform', {
        ports: {
          main: { hint: 8000 },
          auth: { hint: 8001 },
          rbac: { hint: 8002 },
          testapp: { hint: 8003 }
        }
      });
      
      assert(typeof ports === 'object', 'Platform should get multiport object');
      assert(ports.main, 'Should have main port');
      assert(ports.auth, 'Should have auth port');
      assert(ports.rbac, 'Should have rbac port');
      assert(ports.testapp, 'Should have testapp port');
      
      // This is the critical bug we're fixing
      console.log('✅ Platform multiport test passed:', ports);
      
      await release('platform');
    });
  });
});