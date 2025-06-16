#!/usr/bin/env node
// necoportd.js - Neco Porter Daemon
import express from 'express';
import fs from 'fs';
import path from 'path';
import net from 'net';
// import { fileURLToPath } from 'url';
import getPort from 'get-port';
import os from 'os';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const range = process.env.NECOPORT_RANGE?.split('-').map(Number) || [3000, 3999];
const statePath = process.env.NECOPORT_STATE || 
  path.join(os.homedir(), '.necoportd.json');
const leaseDefault = 600; // 10 minutes (cats are patient)

// Cat ASCII art for logging
const startupCat = `
  ╱|、
 (˚ˎ 。7  Neco Porter starting...
  |、˜〵  Preparing to deliver ports!
  じしˍ,)ノ
`;

// Load state
let db = {};
try {
  if (fs.existsSync(statePath)) {
    db = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  }
} catch (e) {
  console.log('(=；ω；=) Failed to load state, starting fresh');
  db = {};
}

const save = () => {
  try {
    fs.writeFileSync(statePath, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('(=TωT=) Failed to save state:', e.message);
  }
};

const app = express(); 
app.use(express.json());

// Verify port is actually free
async function isFree(port) {
  return new Promise(res => {
    const s = net.createServer()
      .once('error', () => res(false))
      .once('listening', () => s.close(() => res(true)))
      .listen(port, '127.0.0.1');
  });
}

// Check if process is still alive
function isProcessAlive(pid) {
  if (!pid) return true; // No PID = assume alive
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

app.post('/reserve', async (req, res) => {
  const { name, hint = 0, lease = leaseDefault, pid } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      error: 'Name is required',
      cat: '(=･ω･=)? Need a name!'
    });
  }
  
  // Check if already reserved
  if (db[name]) {
    const existing = db[name];
    if (isProcessAlive(existing.pid)) {
      console.log(`(=^･ω･^=) ${name} already has port ${existing.port}`);
      return res.json({ port: existing.port, lease });
    } else {
      console.log(`(=˘ω˘=) Process ${existing.pid} died, releasing port ${existing.port}`);
      delete db[name];
    }
  }
  
  let port = hint;
  
  // Find a free port
  if (!port || port < range[0] || port > range[1] || 
      !(await isFree(port)) || 
      Object.values(db).some(v => v.port === port && isProcessAlive(v.pid))) {
    let attempts = 0;
    do {
      // Generate array of ports in range
      const ports = [];
      for (let p = range[0]; p <= range[1]; p++) {
        ports.push(p);
      }
      port = await getPort({ port: ports });
      attempts++;
      if (attempts > 100) {
        return res.status(503).json({ 
          error: 'No free ports available',
          cat: '(=；ω；=) Sorry, all ports are taken...'
        });
      }
    } while (!(await isFree(port)) || 
             Object.values(db).some(v => v.port === port && isProcessAlive(v.pid)));
  }
  
  db[name] = { port, pid, expires: Date.now() + lease * 1000 };
  save();
  
  console.log(`${getCatForPort(port)} Port ${port} assigned to ${name}`);
  res.json({ port, lease });
});

app.post('/release', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      error: 'Name is required',
      cat: '(=･ω･=)? Which service?'
    });
  }
  
  if (db[name]) {
    const port = db[name].port;
    delete db[name];
    save();
    console.log(`${getCatForPort(port)}ﾉ Port ${port} released by ${name}`);
  }
  res.sendStatus(204);
});

app.post('/heartbeat', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      error: 'Name is required',
      cat: '(=･ω･=)? Who are you?'
    });
  }
  
  if (db[name]) {
    db[name].expires = Date.now() + leaseDefault * 1000;
    save();
  }
  res.sendStatus(204);
});

app.get('/list', (_, res) => {
  const entries = Object.entries(db).map(([name, data]) => ({
    name,
    port: data.port,
    expires: data.expires,
    pid: data.pid,
    cat: getCatForPort(data.port),
    alive: isProcessAlive(data.pid)
  }));
  res.json(entries);
});

// Different cats for different ports
function getCatForPort(port) {
  const cats = [
    '(=^･ω･^=)', '(=^‥^=)', '(=｀ω´=)', '(=･ᴥ･=)',
    '(=˘ω˘=)', '(=TωT=)', '(=ΦωΦ=)', '(=ﾟωﾟ=)'
  ];
  return cats[port % cats.length];
}

// Garbage collection with cat logging
setInterval(() => {
  let changed = false;
  const now = Date.now();
  
  for (const [name, data] of Object.entries(db)) {
    // Check if expired
    if (data.expires < now) {
      console.log(`(=˘ω˘=)zzZ Port ${data.port} expired for ${name}`);
      delete db[name];
      changed = true;
      continue;
    }
    
    // Check if process is dead
    if (!isProcessAlive(data.pid)) {
      console.log(`(=･ω･=) Process ${data.pid} died, releasing port ${data.port} for ${name}`);
      delete db[name];
      changed = true;
    }
  }
  
  if (changed) save();
}, 30_000); // Check every 30 seconds

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('\n(=^･ω･^=)ﾉ Neco Porter shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n(=^･ω･^=)ﾉ Neco Porter shutting down...');
  process.exit(0);
});

// Start server
const port = parseInt(process.env.NECOPORTD_PORT || '5555');
console.log(startupCat);

app.listen(port, '127.0.0.1', () => {
  console.log(`(=^･ω･^=) necoportd ready on :${port}`);
  console.log(`(=^･ω･^=) Managing ports ${range[0]}-${range[1]}`);
  console.log(`(=^･ω･^=) State file: ${statePath}\n`);
});