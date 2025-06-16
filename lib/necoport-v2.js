// Neco Porter v2 client library with multi-port support
import { spawn } from 'child_process';

const baseUrl = process.env.NECOPORTD_URL || 'http://localhost:5555';
let activeHeartbeats = new Map();

// Backward compatible - single port reservation
async function reserveSingle(name, hint = 0) {
  try {
    const response = await fetch(`${baseUrl}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, hint, pid: process.pid })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`(=TωT=) Failed to reserve port: ${error.error}`);
      return 0; // Fallback to OS assignment
    }

    const data = await response.json();
    startHeartbeat(name);
    
    console.log(`${data.cat || '(=^･ω･^=)'} Port ${data.port} GET!`);
    return data.port;
  } catch (error) {
    console.error('(=TωT=) necoportd not available:', error.message);
    console.log('(=˘ω˘=) Using random port...');
    return 0; // Let OS assign
  }
}

// v2 - Multi-port reservation
async function reserveMulti(name, options = {}) {
  try {
    const body = {
      name,
      pid: process.pid,
      ...options
    };

    const response = await fetch(`${baseUrl}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`(=TωT=) Failed to reserve ports: ${error.error}`);
      
      // Fallback for multi-port
      if (options.count) {
        const ports = {};
        for (let i = 0; i < options.count; i++) {
          ports[i] = 0;
        }
        return ports;
      }
      if (options.ports) {
        const ports = {};
        for (const name of Object.keys(options.ports)) {
          ports[name] = 0;
        }
        return ports;
      }
      return { main: 0 };
    }

    const data = await response.json();
    startHeartbeat(name);
    
    // Log success
    if (data.ports) {
      console.log(`(=^･ω･^=) Ports reserved for ${name}:`);
      for (const [portName, port] of Object.entries(data.ports)) {
        console.log(`  ${portName}: ${port}`);
      }
      return data.ports;
    } else {
      console.log(`${data.cat || '(=^･ω･^=)'} Port ${data.port} GET!`);
      return data.port;
    }
  } catch (error) {
    console.error('(=TωT=) necoportd not available:', error.message);
    console.log('(=･ω･=) Using random ports...');
    
    // Fallback
    if (options.count) {
      const ports = {};
      for (let i = 0; i < options.count; i++) {
        ports[i] = 0;
      }
      return ports;
    }
    if (options.ports) {
      const ports = {};
      for (const name of Object.keys(options.ports)) {
        ports[name] = 0;
      }
      return ports;
    }
    return 0;
  }
}

// Main reserve function with overloads
export async function reserve(name, hintOrOptions) {
  // v1 compatibility - reserve(name, hint)
  if (typeof hintOrOptions === 'number' || hintOrOptions === undefined) {
    return reserveSingle(name, hintOrOptions);
  }
  
  // v2 - reserve(name, options)
  return reserveMulti(name, hintOrOptions);
}

// Release ports
export async function release(name, portName = null) {
  stopHeartbeat(name);
  
  try {
    const body = { name };
    if (portName) {
      body.portName = portName;
    }
    
    await fetch(`${baseUrl}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    console.log('(=･ω･=)ﾉ Port released!');
  } catch (error) {
    // Silent fail - port will expire anyway
  }
}

// List all reservations
export async function list() {
  try {
    const response = await fetch(`${baseUrl}/list`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.map(entry => ({
      name: entry.name,
      port: entry.port,
      ports: entry.ports || { main: entry.port },
      cat: entry.cat,
      expires: entry.expires,
      pid: entry.pid,
      alive: entry.alive
    }));
  } catch {
    return [];
  }
}

// Get ports for specific service (v2)
export async function getPorts(name) {
  try {
    const response = await fetch(`${baseUrl}/ports/${name}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.ports;
  } catch {
    return null;
  }
}

// Enhanced withPort for v2
export async function withPort(name, callback, hintOrOptions) {
  const ports = await reserve(name, hintOrOptions);
  
  try {
    // v1 compatibility - single port as number
    if (typeof ports === 'number') {
      return await callback(ports);
    }
    
    // v2 - multiple ports as object
    return await callback(ports);
  } finally {
    await release(name);
  }
}

// Heartbeat management
function startHeartbeat(name) {
  stopHeartbeat(name);
  
  const interval = setInterval(async () => {
    try {
      await fetch(`${baseUrl}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    } catch {
      // Silent fail
    }
  }, 300_000); // 5 minutes
  
  activeHeartbeats.set(name, interval);
}

function stopHeartbeat(name) {
  const interval = activeHeartbeats.get(name);
  if (interval) {
    clearInterval(interval);
    activeHeartbeats.delete(name);
  }
}

// Cleanup on exit
process.on('exit', () => {
  for (const interval of activeHeartbeats.values()) {
    clearInterval(interval);
  }
});

// Export v2 specific functions
export const v2 = {
  reserveMulti,
  getPorts
};