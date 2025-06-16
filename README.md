# 🐱 Neco Porter v2

> Smart port management where cats deliver all your ports!

<div align="center">

```
  ╱|、
(˚ˎ 。7  
 |、˜〵   
 じしˍ,)ノ
```

**"Just run `neco .` - I'll handle the rest!"**

[![npm version](https://img.shields.io/npm/v/neco-porter.svg)](https://www.npmjs.com/package/neco-porter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## What is Neco Porter?

An intelligent port management service that automatically detects your project type and manages ports - no more "port already in use" errors!

```bash
# Just this!
$ cd my-project
$ neco .
🔍 Analyzing project...
🚀 Starting app with managed ports...
```

## Features

- 🧠 **Smart Detection** - Automatically identifies project type and starts it
- 🐱 **Cat-powered** - Every port comes with a friendly cat
- 🚀 **Zero conflicts** - Automatic port assignment
- 🔄 **Multi-port Support** - Manage multiple ports for complex apps
- 🌍 **Universal** - Works with any language or framework
- 📦 **No app changes needed** - Works with existing apps
- 💨 **Lightweight** - Simple and fast
- 😊 **Joyful** - Makes development more fun

## Quick Start

```bash
# Install
npm install -g neco-porter

# That's it! Just run:
cd your-project
neco .
```

The `neco` command will:
1. 🔍 Detect your project type (Node.js, Python, Ruby, etc.)
2. 📋 Find the right startup command
3. 🐱 Reserve ports automatically
4. 🚀 Start your app with zero conflicts!

## Why Cats?

Because development should be fun! Every time you start a service, a cat celebrates your productivity.

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

### Basic Usage - Just One Command!

```bash
# Auto-detect and start any project
neco .

# Or specify the command
neco python app.py
neco npm run dev
neco rails server
```

### Multi-Port Applications

```bash
# Using command line options
neco --ports main:8000,api:8001,websocket:8002 python app.py

# Or create .necoport.yaml
version: 1
services:
  app:
    command: "python app.py"
    ports:
      main:
        hint: 8000
      api:
        hint: 8001
```

### Management Commands

```bash
# Check what's running
neco status

# Stop everything
neco stop
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

### Auto-Detection Magic

```bash
$ cd my-django-project
$ neco .
🔍 Analyzing project...
📋 Found: manage.py
🚀 Running: python manage.py runserver
```

Neco Porter automatically detects:
- **Python**: `app.py`, `main.py`, `manage.py`, `requirements.txt`
- **Node.js**: `package.json` scripts, `server.js`, `index.js`
- **Ruby**: `Gemfile`, `config.ru`, Rails projects
- **Go**: `go.mod`, `main.go`
- **Docker**: `docker-compose.yml`
- **Make**: `Makefile` with run/start/serve targets
- **Heroku**: `Procfile`

### Port Management

1. **Auto-assignment**: Finds free ports automatically
2. **Environment Variables**: Sets `$PORT` (and `$PORT_API`, etc. for multi-port apps)
3. **No conflicts**: Tracks all ports across all projects
4. **Auto-cleanup**: Releases ports when your app stops

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
| "jq is required but not installed" | Install jq (see Requirements section) |
| "necoportd not running, using random port" | Start necoportd daemon first |

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
