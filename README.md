# 🐱 Neco Porter

> Port management service where cats deliver your ports!

<div align="center">

```
  ╱|、
 (˚ˎ 。7   "Need a port? I'll bring you one!"
  |、˜〵   
  じしˍ,)ノ
```

[![npm version](https://img.shields.io/npm/v/neco-porter.svg)](https://www.npmjs.com/package/neco-porter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## What is Neco Porter?

A minimal port management service that eliminates "port already in use" errors by having cats deliver available ports to your development processes.

```bash
$ necoport-client exec web npm run dev
(=^･ω･^=)  Port 3000 GET!
```

## Features

- 🐱 **Cat-powered** - Every port comes with a friendly cat
- 🚀 **Zero conflicts** - Automatic port assignment
- 🌍 **Universal** - Works with any language or framework
- 💨 **Lightweight** - Under 100 lines of core logic
- 🎯 **Dev-only** - Never ships to production
- 😊 **Joyful** - Makes development more fun

## Quick Start

```bash
# Install
npm install -g neco-porter

# Start the cat daemon
necoportd &

# Let a cat bring you a port
necoport-client exec myapp npm run dev
```

## Why Cats?

Because development should be fun! Every time you start a service, a cat celebrates your productivity.

Different ports get different cats:
- `(=^･ω･^=)` - The classic cat
- `(=^‥^=)` - The content cat  
- `(=｀ω´=)` - The determined cat
- `(=･ᴥ･=)` - The friendly cat

## Installation

### npm (Global)
```bash
npm install -g neco-porter
```

### npm (Project)
```bash
npm install --save-dev neco-porter
```

### From Source
```bash
git clone https://github.com/R9a00/neco-porter.git
cd neco-porter
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

### Run Your Apps

```bash
# Basic usage
necoport-client exec myapp npm run dev

# Python app
necoport-client exec api python app.py

# Ruby app
necoport-client exec web rails server

# Any command that uses $PORT
necoport-client exec server ./start.sh
```

### Other Commands

```bash
# List all active ports
necoport-client list

# Reserve a port manually
necoport-client reserve myservice

# Release a port
necoport-client release myservice
```

## Integration

### npm scripts
```json
{
  "scripts": {
    "dev": "necoport-client exec web vite",
    "api": "necoport-client exec api nodemon server.js",
    "storybook": "necoport-client exec storybook start-storybook"
  }
}
```

### Node.js API
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

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NECOPORT_RANGE` | `3000-3999` | Port allocation range |
| `NECOPORTD_PORT` | `5555` | Daemon listen port |
| `NECOPORTD_URL` | `http://localhost:5555` | Daemon URL (for client) |
| `NECOPORT_STATE` | `~/.necoportd.json` | State file location |

## How It Works

1. **necoportd** runs in the background managing port assignments
2. When you need a port, ask a cat to fetch one
3. The cat finds a free port and delivers it via `$PORT`
4. Your app starts with zero conflicts
5. Ports are automatically released when your app stops
6. Everyone is happy, especially the cats

## API Reference

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reserve` | POST | Reserve a port |
| `/release` | POST | Release a port |
| `/heartbeat` | POST | Keep reservation alive |
| `/list` | GET | List all reservations |

### Node.js Client

```javascript
// Reserve with hint
const port = await reserve('web', 3000);

// List all ports
const ports = await list();
ports.forEach(p => console.log(`${p.cat} ${p.name} on port ${p.port}`));
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
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Start necoportd first |
| No free ports | Increase NECOPORT_RANGE |
| Port already in use | Check `necoport-client list` |
| Daemon won't start | Check if port 5555 is free |

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Cat ASCII Art Guidelines

- Keep them under 20 characters wide
- Use standard ASCII/Unicode
- Test in various terminals
- Ensure they bring joy

## License

MIT - Cats roam free!

---

<div align="center">
  <sub>Built with love and paws 🐾</sub>
</div>
