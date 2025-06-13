// necoport.js - Node.js client with cat support
const NECOPORTD_URL = process.env.NECOPORTD_URL || 'http://localhost:5555';

// Cat collection for different occasions
const CATS = {
  success: ['(=^･ω･^=)', '(=^‥^=)', '(=｀ω´=)', '(=･ᴥ･=)'],
  waiting: ['(=˘ω˘=)', '(=･ω･=)'],
  error: ['(=；ω；=)', '(=TωT=)'],
  goodbye: ['(=^･ω･^=)ﾉ', '(=･ω･=)ﾉ']
};

function getRandomCat(mood = 'success') {
  const cats = CATS[mood] || CATS.success;
  return cats[Math.floor(Math.random() * cats.length)];
}

/**
 * Reserve a port for a service
 * @param {string} name - Service name
 * @param {number} hint - Preferred port (optional)
 * @returns {Promise<number>} - Assigned port number
 */
export async function reserve(name, hint = 0) {
  try {
    const res = await fetch(`${NECOPORTD_URL}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, hint, pid: process.pid })
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log(`${getRandomCat()} Port ${data.port} GET!`);
    
    // Setup heartbeat
    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`${NECOPORTD_URL}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
      } catch {
        // Silent fail for heartbeat
      }
    }, 300_000); // 5 minutes
    
    // Store interval for cleanup
    if (!global._necoPorterHeartbeats) {
      global._necoPorterHeartbeats = new Map();
    }
    global._necoPorterHeartbeats.set(name, heartbeatInterval);
    
    return data.port;
    
  } catch (error) {
    console.warn(`${getRandomCat('error')} necoportd not available: ${error.message}`);
    console.warn(`${getRandomCat('waiting')} Using random port...`);
    return 0;
  }
}

/**
 * Release a reserved port
 * @param {string} name - Service name
 */
export async function release(name) {
  try {
    // Clear heartbeat
    if (global._necoPorterHeartbeats?.has(name)) {
      clearInterval(global._necoPorterHeartbeats.get(name));
      global._necoPorterHeartbeats.delete(name);
    }
    
    await fetch(`${NECOPORTD_URL}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    console.log(`${getRandomCat('goodbye')} Port released!`);
  } catch {
    // Silent release
  }
}

/**
 * Get list of all reserved ports
 * @returns {Promise<Array>} - List of port reservations
 */
export async function list() {
  try {
    const res = await fetch(`${NECOPORTD_URL}/list`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`${getRandomCat('error')} Could not fetch port list: ${error.message}`);
    return [];
  }
}

/**
 * Reserve a port, run a callback, then release
 * @param {string} name - Service name
 * @param {Function} callback - Async function that receives the port
 * @param {number} hint - Preferred port (optional)
 * @returns {Promise<any>} - Result of callback
 */
export async function withPort(name, callback, hint = 0) {
  const port = await reserve(name, hint);
  try {
    return await callback(port);
  } finally {
    await release(name);
  }
}

// Cleanup on process exit
['SIGINT', 'SIGTERM', 'exit'].forEach(event => {
  process.on(event, () => {
    if (global._necoPorterHeartbeats) {
      for (const [name, interval] of global._necoPorterHeartbeats) {
        clearInterval(interval);
        // Try to release synchronously on exit
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${NECOPORTD_URL}/release`, false);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({ name }));
        } catch {
          // Silent fail
        }
      }
    }
  });
});

// CLI usage example
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'reserve':
      const [name, hint] = args;
      if (!name) {
        console.error('(=･ω･=)? Usage: node necoport.js reserve <name> [hint]');
        process.exit(1);
      }
      reserve(name, parseInt(hint) || 0).then(port => {
        console.log(`Port: ${port}`);
      });
      break;
      
    case 'list':
      list().then(ports => {
        if (ports.length === 0) {
          console.log('(=˘ω˘=) No ports reserved');
        } else {
          console.log('  ╱|、');
          console.log(' (˚ˎ 。7   Active ports:');
          console.log('  |、˜〵');
          console.log('  じしˍ,)ノ');
          console.log('');
          ports.forEach(p => {
            console.log(`${p.cat} Port ${p.port} - ${p.name}`);
          });
        }
      });
      break;
      
    case 'demo':
      console.log('(=^･ω･^=) Running demo...');
      withPort('demo-service', async (port) => {
        console.log(`Starting demo server on port ${port}...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('Demo complete!');
      });
      break;
      
    default:
      console.log(`
  ╱|、
 (˚ˎ 。7   Neco Porter Node.js Client
  |、˜〵   
  じしˍ,)ノ Usage:
         
  node necoport.js reserve <name> [hint]  - Reserve a port
  node necoport.js list                   - List all ports
  node necoport.js demo                   - Run a demo
`);
  }
}