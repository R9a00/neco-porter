#!/usr/bin/env node
// necoportd.js - Neco Porter Daemon v2 with multi-port support
import express from 'express';
import fs from 'fs';
import path from 'path';
import net from 'net';
import getPort from 'get-port';
import os from 'os';
import { 
  migrateDatabase, 
  createReservation, 
  getPortsFromReservation,
  isReservationAlive,
  cleanDeadProcesses,
  DB_VERSION
} from './db-utils.js';

const range = process.env.NECOPORT_RANGE?.split('-').map(Number) || [3000, 3999];
const statePath = process.env.NECOPORT_STATE || 
  path.join(os.homedir(), '.necoportd.json');
const leaseDefault = 600; // 10 minutes (cats are patient)

// Cat ASCII art for logging
const startupCat = `
  ╱|、
(˚ˎ 。7  Neco Porter v2 starting...
 |、˜〵  Now with multi-port support!
 じしˍ,)ノ
`;

// Load and migrate state
let db = {};
try {
  if (fs.existsSync(statePath)) {
    const loaded = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    db = migrateDatabase(loaded);
    console.log('(=^･ω･^=) Loaded and migrated state');
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

// Find available ports
async function findAvailablePorts(count, hints = {}) {
  const foundPorts = {};
  const usedPorts = new Set();
  
  // Collect all currently used ports
  for (const reservation of Object.values(db)) {
    if (reservation.ports) {
      for (const portData of Object.values(reservation.ports)) {
        if (isProcessAlive(portData.pid)) {
          usedPorts.add(portData.port);
        }
      }
    } else if (reservation.port) {
      usedPorts.add(reservation.port);
    }
  }
  
  // Try hints first
  for (const [name, hint] of Object.entries(hints)) {
    if (hint && !usedPorts.has(hint) && await isFree(hint)) {
      foundPorts[name] = hint;
      usedPorts.add(hint);
    }
  }
  
  // Find remaining ports
  const portNames = Object.keys(hints);
  const remaining = portNames.filter(name => !foundPorts[name]);
  
  if (remaining.length > 0 || count > 0) {
    const needed = remaining.length || count;
    const portArray = [];
    for (let p = range[0]; p <= range[1] && portArray.length < needed; p++) {
      if (!usedPorts.has(p)) {
        portArray.push(p);
      }
    }
    
    const availablePorts = await getPort({ port: portArray });
    
    if (remaining.length > 0) {
      foundPorts[remaining[0]] = availablePorts;
    } else {
      for (let i = 0; i < count; i++) {
        const p = await getPort({ port: portArray });
        foundPorts[i] = p;
        portArray.splice(portArray.indexOf(p), 1);
      }
    }
  }
  
  return foundPorts;
}

// Enhanced reserve endpoint with v2 features
app.post('/reserve', async (req, res) => {
  const { name, hint = 0, lease = leaseDefault, pid, ports, count } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      error: 'Name is required',
      cat: '(=･ω･=)? Need a name!'
    });
  }
  
  // Check if already reserved
  if (db[name]) {
    const existing = db[name];
    if (isReservationAlive(existing, isProcessAlive)) {
      // Return existing reservation
      const existingPorts = getPortsFromReservation(existing);
      
      // v1 compatibility response
      if (!ports && !count) {
        console.log(`(=^･ω･^=) ${name} already has port ${existing.port}`);
        return res.json({ port: existing.port, lease });
      }
      
      // v2 response
      console.log(`(=^･ω･^=) ${name} already has ports:`, existingPorts);
      return res.json({ 
        port: existing.port,  // v1 compatibility
        ports: existingPorts,
        lease 
      });
    } else {
      console.log(`(=˘ω˘=) Process died, releasing ports for ${name}`);
      delete db[name];
    }
  }
  
  try {
    let foundPorts;
    
    // v1 mode - single port
    if (!ports && !count) {
      foundPorts = await findAvailablePorts(0, { main: hint });
      const port = foundPorts.main || await getPort({ port: range });
      
      db[name] = createReservation({
        ports: port,
        pid,
        expires: Date.now() + lease * 1000
      });
      save();
      
      console.log(`${getCatForPort(port)} Port ${port} assigned to ${name}`);
      return res.json({ port, lease });
    }
    
    // v2 mode - multiple ports
    if (ports) {
      // Named ports
      const hints = {};
      for (const [portName, portConfig] of Object.entries(ports)) {
        hints[portName] = portConfig.hint || 0;
      }
      foundPorts = await findAvailablePorts(0, hints);
    } else if (count) {
      // Count-based
      foundPorts = await findAvailablePorts(count);
    }
    
    db[name] = createReservation({
      ports: foundPorts,
      pid,
      expires: Date.now() + lease * 1000
    });
    save();
    
    const mainPort = foundPorts.main || foundPorts[Object.keys(foundPorts)[0]];
    console.log(`${getCatForPort(mainPort)} Ports assigned to ${name}:`, foundPorts);
    
    return res.json({ 
      port: mainPort,      // v1 compatibility
      ports: foundPorts,   // v2 feature
      lease 
    });
    
  } catch (error) {
    console.error('(=TωT=) Error reserving ports:', error);
    return res.status(503).json({ 
      error: 'Failed to reserve ports',
      cat: '(=；ω；=) Sorry, something went wrong...'
    });
  }
});

app.post('/release', (req, res) => {
  const { name, portName } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      error: 'Name is required',
      cat: '(=･ω･=)? Which service?'
    });
  }
  
  if (db[name]) {
    // Release specific port (v2) or all ports (v1)
    if (portName && db[name].ports && db[name].ports[portName]) {
      const port = db[name].ports[portName].port;
      delete db[name].ports[portName];
      
      // If no ports left, remove the service
      if (Object.keys(db[name].ports).length === 0) {
        delete db[name];
      }
      
      console.log(`${getCatForPort(port)}ﾉ Port ${port} (${portName}) released by ${name}`);
    } else {
      const ports = getPortsFromReservation(db[name]);
      delete db[name];
      console.log(`${getCatForPort(db[name].port)}ﾉ All ports released by ${name}:`, ports);
    }
    
    save();
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
  const entries = [];
  
  for (const [name, data] of Object.entries(db)) {
    const ports = getPortsFromReservation(data);
    const isAlive = isReservationAlive(data, isProcessAlive);
    
    // v1 compatibility - single entry per service
    entries.push({
      name,
      port: data.port,
      ports,  // v2 addition
      expires: data.expires,
      pid: data.pid,
      cat: getCatForPort(data.port),
      alive: isAlive,
      version: data.version || '1.0.0'
    });
  }
  
  res.json(entries);
});

// New v2 endpoint for getting specific service ports
app.get('/ports/:name', (req, res) => {
  const { name } = req.params;
  
  if (!db[name]) {
    return res.status(404).json({ 
      error: 'Service not found',
      cat: '(=･ω･=)? Never heard of it...'
    });
  }
  
  const ports = getPortsFromReservation(db[name]);
  res.json({ 
    name,
    ports,
    expires: db[name].expires,
    alive: isReservationAlive(db[name], isProcessAlive)
  });
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
      const ports = getPortsFromReservation(data);
      console.log(`(=˘ω˘=)zzZ Ports expired for ${name}:`, ports);
      delete db[name];
      changed = true;
      continue;
    }
    
    // Clean dead processes
    const cleaned = cleanDeadProcesses(data, isProcessAlive);
    if (!cleaned) {
      console.log(`(=･ω･=) All processes died for ${name}, releasing ports`);
      delete db[name];
      changed = true;
    } else if (cleaned !== data) {
      db[name] = cleaned;
      changed = true;
    }
  }
  
  if (changed) save();
}, 30_000); // Check every 30 seconds

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('\n(=^･ω･^=)ﾉ Neco Porter v2 shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n(=^･ω･^=)ﾉ Neco Porter v2 shutting down...');
  process.exit(0);
});

// Start server
const port = parseInt(process.env.NECOPORTD_PORT || '5555');
console.log(startupCat);

app.listen(port, '127.0.0.1', () => {
  console.log(`(=^･ω･^=) necoportd v2 ready on :${port}`);
  console.log(`(=^･ω･^=) Managing ports ${range[0]}-${range[1]}`);
  console.log(`(=^･ω･^=) State file: ${statePath}`);
  console.log(`(=^･ω･^=) Database version: ${DB_VERSION}\n`);
});