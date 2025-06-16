# 🐱 Neco Porter v2.0

> Multi-port management service where cats deliver all your ports!

<div align="center">

```
  ╱|、
 (˚ˎ 。7   "Need multiple ports? I'll bring them all!"
  |、˜〵   
  じしˍ,)ノ
```

[![npm version](https://img.shields.io/npm/v/neco-porter.svg)](https://www.npmjs.com/package/neco-porter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## 🎉 New in v2.0

- **Multi-port support** - Reserve multiple ports with a single command
- **Named ports** - Organize ports by purpose (main, api, websocket, etc.)
- **Zero conflicts guaranteed** - Even with complex multi-port applications
- **Full backward compatibility** - v1 clients work seamlessly with v2

## What is Neco Porter?

A port management service that eliminates "port already in use" errors by having cats deliver available ports to your development processes. Now with v2.0, cats can deliver multiple ports at once!

### Single Port (Classic)
```bash
$ necoport-client exec web npm run dev
(=^･ω･^=)  Port 3000 GET!
```

### Multi-Port (New in v2.0)
```bash
$ necoport-client exec myapp --ports main,api,websocket npm run dev
(=^･ω･^=)  Ports GET!
  PORT=3001
  PORT_API=3002
  PORT_WEBSOCKET=3003
```

## Features

- 🐱 **Cat-powered** - Every port comes with a friendly cat
- 🚀 **Zero conflicts** - Automatic port assignment for all your services
- 🎯 **Multi-port apps** - Perfect for modern development with HMR, WebSockets, etc.
- 🌍 **Universal** - Works with any language or framework
- 💨 **Lightweight** - Minimal overhead, maximum joy
- 🔄 **Backward compatible** - Existing setups continue to work
- 😊 **Joyful** - Makes development more fun

## Quick Start

```bash
# Install
npm install -g neco-porter@next  # v2 is currently in beta

# Start the cat daemon
necoportd &

# Single port (classic)
necoport-client exec myapp npm run dev

# Multiple named ports (v2)
necoport-client exec myapp --ports main,api,metrics npm run dev

# Multiple ports by count (v2)
necoport-client exec myapp --count 3 python app.py
```

## Why Cats?

Because development should be fun! Every time you start a service, a cat celebrates your productivity. With v2.0, cats work together to deliver multiple ports at once!

Different ports get different cats:
- `(=^･ω･^=)` - The classic cat
- `(=^‥^=)` - The content cat  
- `(=｀ω´=)` - The determined cat
- `(=･ᴥ･=)` - The friendly cat

## Requirements

- Node.js >= 18.0.0
- jq (required for the CLI client)
  - macOS: `brew install jq`
  - Ubuntu/Debian: `sudo apt-get install jq`
  - Other: [Download jq](https://stedolan.github.io/jq/download/)

## Installation

### npm (Global)
```bash
npm install -g neco-porter@next
```

### npm (Project)
```bash
npm install --save-dev neco-porter@next
```

### From Source
```bash
git clone https://github.com/R9a00/neco-porter.git
cd neco-porter
git checkout feature/v2-multi-port
npm install
npm link
```

## Usage

### Start the Daemon

```bash
# Start in foreground
necoportd

# Start in background
necoportd &

# With custom port range
NECOPORT_RANGE=8000-8999 necoportd
```

### Single Port Mode (v1 Compatible)

```bash
# Basic usage
necoport-client exec myapp npm run dev

# Python app
necoport-client exec api python app.py

# Any command that uses $PORT
necoport-client exec server ./start.sh
```

### Multi-Port Mode (v2 New!)

#### Named Ports
```bash
# Reserve specific named ports
necoport-client exec myapp --ports main,api,websocket npm run dev

# With port hints
necoport-client exec myapp --ports main:3000,api:8080 npm run dev

# Environment variables set:
# PORT=3001         (always set for compatibility)
# PORT_API=3002
# PORT_WEBSOCKET=3003
```

#### Count-Based
```bash
# Reserve 3 ports
necoport-client exec myapp --count 3 npm run dev

# Environment variables set:
# PORT=3001    (always set)
# PORT_1=3002
# PORT_2=3003
```

### Other Commands

```bash
# List all active ports (v2 shows all ports per service)
necoport-client list

# Reserve ports manually
necoport-client reserve myservice --ports main,api

# Release all ports for a service
necoport-client release myservice

# Release specific port (v2)
necoport-client release myservice api
```

## Real-World Examples

### Modern Web Development (Vite/Webpack)
```bash
# Vite with HMR
necoport-client exec vite-app --ports server,hmr npm run dev

# Webpack Dev Server with multiple services
necoport-client exec webpack-app --ports dev,hmr,api-proxy npm start
```

### Microservices Development
```bash
# Start multiple services without conflicts
necoport-client exec frontend --ports web,ws npm run dev &
necoport-client exec backend --ports api,grpc,metrics python app.py &
necoport-client exec admin --count 2 npm run dev &
```

### Full-Stack Application
```json
// package.json scripts
{
  "scripts": {
    "dev": "necoport-client exec myapp --ports frontend,backend,db npm run start-all",
    "frontend": "VITE_API_PORT=$PORT_BACKEND vite --port $PORT",
    "backend": "node server.js --port $PORT_BACKEND --db-port $PORT_DB"
  }
}
```

## Integration

### npm scripts
```json
{
  "scripts": {
    "dev": "necoport-client exec web vite",
    "dev:multi": "necoport-client exec web --ports dev,hmr,preview vite",
    "api": "necoport-client exec api --ports http,grpc node server.js",
    "all": "concurrently npm:dev:multi npm:api"
  }
}
```

### Node.js API

#### Single Port (v1 Compatible)
```javascript
import { reserve, release, withPort } from 'neco-porter';

// Reserve a port
const port = await reserve('myapp');
console.log(`Got port ${port}!`);

// Use and release
await withPort('myapp', async (port) => {
  console.log(`Starting server on port ${port}`);
  // Your server code here
});
```

#### Multi-Port (v2)
```javascript
import { reserve, release, withPort } from 'neco-porter';

// Reserve multiple named ports
const ports = await reserve('myapp', {
  ports: {
    main: { hint: 3000 },
    api: { hint: 8080 },
    metrics: { hint: 9090 }
  }
});
console.log(ports); // { main: 3001, api: 8081, metrics: 9091 }

// Reserve by count
const ports = await reserve('myapp', { count: 3 });
console.log(ports); // { '0': 3001, '1': 3002, '2': 3003 }

// With automatic cleanup
await withPort('myapp', async (ports) => {
  console.log(`Main server on ${ports.main}`);
  console.log(`API server on ${ports.api}`);
  // Your multi-server code here
}, { ports: { main: {}, api: {} } });
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NECOPORT_RANGE` | `3000-3999` | Port allocation range |
| `NECOPORTD_PORT` | `5555` | Daemon listen port |
| `NECOPORTD_URL` | `http://localhost:5555` | Daemon URL (for client) |
| `NECOPORT_STATE` | `~/.necoportd.json` | State file location |

## How It Works

1. **necoportd** runs in the background managing port assignments
2. When you need ports, ask a cat to fetch them
3. The cat finds free ports and delivers them via environment variables
4. Your app starts with zero conflicts
5. Ports are automatically released when your app stops
6. Everyone is happy, especially the cats

### v2 Multi-Port Flow

1. Request multiple ports with `--ports` or `--count`
2. Daemon ensures no conflicts across all services
3. Each port gets its own environment variable
4. All ports released together when process ends

## Migration from v1

### No Changes Required!
- v1 commands continue to work exactly the same
- v1 API calls are fully supported
- Existing integrations need no modifications

### Adopting v2 Features
Simply add the new options when ready:
```bash
# Old (still works)
necoport-client exec myapp npm run dev

# New (when you need multiple ports)
necoport-client exec myapp --ports main,api,ws npm run dev
```

## API Reference

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reserve` | POST | Reserve port(s) - supports both v1 and v2 |
| `/release` | POST | Release port(s) |
| `/heartbeat` | POST | Keep reservation alive |
| `/list` | GET | List all reservations |
| `/ports/:name` | GET | Get ports for specific service (v2) |

### Node.js Client

```javascript
// v1 Compatible
reserve(name: string, hint?: number): Promise<number>

// v2 Overloads
reserve(name: string, options: {
  ports?: Record<string, { hint?: number }>,
  count?: number
}): Promise<Record<string, number>>

// Release all or specific port
release(name: string, portName?: string): Promise<void>

// List with multi-port info
list(): Promise<Array<{
  name: string,
  port: number,        // v1 compat
  ports?: Record<string, number>  // v2
}>>
```

## Docker Support

```yaml
version: '3.8'
services:
  necoportd:
    image: neco-porter:latest
    ports:
      - "127.0.0.1:5555:5555"
    volumes:
      - ~/.necoportd.json:/data/necoportd.json
      
  app:
    image: myapp
    environment:
      - NECOPORTD_URL=http://necoportd:5555
    command: necoport-client exec app --ports web,api,ws npm start
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Start necoportd first |
| No free ports | Increase NECOPORT_RANGE |
| Port already in use | Check `necoport-client list` |
| Daemon won't start | Check if port 5555 is free |
| "jq is required but not installed" | Install jq (see Requirements section) |
| "necoportd not running, using random port" | Start necoportd daemon first |
| v2 features not working | Update to latest version with `npm install -g neco-porter@next` |

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### v2 Development

The v2 branch includes:
- Multi-port reservation system
- Backward compatibility layer
- Enhanced test coverage
- Migration tooling

## License

MIT - Cats roam free!

---

<div align="center">
  <sub>Built with love and paws 🐾</sub>
  <br>
  <sub>v2.0 - Now with more cats working together!</sub>
</div>