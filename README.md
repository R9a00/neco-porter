# 🐱 Neco Porter v2.3

> **Zero-conflict port management** - Just add `neco` to any command!

<div align="center">

```
╱|、
(˚ˎ 。7  
 |、˜〵   
 じしˍ,)ノ
```

**"No more port conflicts, ever. Just add `neco` to your command."**

[![npm version](https://img.shields.io/npm/v/neco-porter.svg)](https://www.npmjs.com/package/neco-porter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## What is Neco Porter?

**The ultimate solution to port conflicts in development.** Add `neco` to any command and ports are automatically managed - no app changes needed!

```bash
# Instead of port conflicts...
$ python app.py          # Error: Port 3000 already in use
$ node server.js         # Error: Port 3000 already in use

# Just add neco!
$ neco python app.py     # ✨ Runs on auto-assigned port
$ neco node server.js    # ✨ Runs on different port
$ neco npm run dev       # ✨ Always works!
```

## 🎆 Key Features

### 🎉 **Zero Conflict Guarantee**
- **No more "port already in use" errors**
- Works with any command, any language, any framework
- Automatic port detection and conflict resolution

### 🚀 **Universal Compatibility** 
```bash
neco python app.py       # Python/Django/Flask
neco node server.js      # Node.js/Express/React
neco rails server        # Ruby on Rails
neco php -S localhost    # PHP
neco docker-compose up   # Docker
neco ./start.sh          # Any script
```

### 🧠 **Smart Port Management**
- **Hardcoded ports?** Automatically detected and managed
- **Environment variables?** Seamlessly integrated
- **Multiple services?** Each gets its own port
- **Proxy forwarding?** Access via original port

### 🐱 **Cat-Powered Simplicity**
- Add `neco` to any command
- Zero configuration required
- No app changes needed
- Comprehensive debugging tools when you need them

## 🚀 Quick Start

```bash
# Install
npm install -g neco-porter

# Add neco to ANY command - that's it!
neco python app.py
neco npm run dev  
neco rails server
neco docker-compose up
```

## 🌟 Real-World Examples

### Development Servers
```bash
# React/Vue/Angular development
neco npm run dev        # Port 3000 → auto-assigned
neco yarn start         # No conflicts!
neco npx vite          # Works with any bundler

# Python web apps
neco python manage.py runserver  # Django
neco flask run                    # Flask
neco python app.py               # Any Python server

# Node.js backends
neco node server.js     # Express, Fastify, etc.
neco npm start          # Any npm script
neco nodemon app.js     # Development tools
```

### Multiple Services (Microservices)
```bash
# Terminal 1
neco python auth-service.py      # Auto-assigned port

# Terminal 2  
neco node api-gateway.js         # Different port

# Terminal 3
neco rails user-service          # No conflicts!

# All accessible via their original ports through proxy!
```

### Docker & Complex Setups
```bash
neco docker-compose up           # Manages all container ports
neco ./start-dev-environment.sh  # Complex startup scripts
neco kubectl port-forward        # Kubernetes port forwarding
```

## 🔧 When Things Go Wrong

### Port Management
```bash
neco ports              # See all ports in use
neco port 3000          # Check specific port details
neco release 3000       # Free up a port (gracefully)
neco test 3000          # Test if port is available
```

### Diagnostics
```bash
neco doctor             # Full environment diagnosis
neco ps                 # List neco-managed processes
neco logs <service>     # View service logs
neco status             # Overall system status
```

### Process Management
```bash
neco stop               # Stop all neco services
neco restart <service>  # Restart specific service
```

## 🐱 Why Cats?

Because development should be joyful! Every port reservation comes with a friendly cat:
- `(=^･ω･^=)` - Port reserved successfully
- `(=^‥^=)` - Port released
- `(=｀ω´=)` - Port conflict detected (but resolved!)
- `(=･ᴥ･=)` - Special operations

## 📊 How It Works

### Automatic Conflict Resolution
1. **Detection**: Scans code for hardcoded ports
2. **Assignment**: Finds available ports automatically  
3. **Environment**: Sets PORT variables for your app
4. **Monitoring**: Tracks actual ports your app uses
5. **Proxy**: Sets up transparent forwarding when needed

### Smart Port Assignment
```bash
# App wants port 3000, but it's busy
neco python app.py

# Neco automatically:
# 1. Detects conflict
# 2. Assigns port 3001 instead  
# 3. Sets PORT=3001
# 4. App runs successfully!
# 5. Creates proxy 3000 → 3001 if needed
```

## 💻 Requirements

- Node.js >= 18.0.0
- Works on macOS, Linux, Windows
- No additional dependencies required

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g neco-porter

# Verify installation
neco help
```

### Project-Local Installation
```bash
npm install --save-dev neco-porter

# Use with npx
npx neco python app.py
```

### Development Installation
```bash
git clone https://github.com/R9a00/neco-porter.git
cd neco-porter
npm install
npm link
```

## 🚀 Advanced Usage

### Auto-Detection
```bash
neco .                  # Smart project detection
```
Neco automatically detects:
- `package.json` → runs npm scripts
- `requirements.txt` → runs Python files  
- `Gemfile` → runs Ruby/Rails
- `go.mod` → runs Go applications
- `.necoport.yaml` → uses custom config

### Configuration File
Create `.necoport.yaml` for complex projects:

```yaml
version: '2.0'
services:
  web:
    command: python manage.py runserver
    ports:
      main: { hint: 8000 }
    env:
      DJANGO_DEBUG: true
      
  api:
    command: node api-server.js
    ports:
      main: { hint: 3000 }
      websocket: { hint: 3001 }
```

Then run:
```bash
neco web                # Start web service
neco api                # Start API service
```

### Multi-Port Support
```bash
# Command line options
neco --ports web:8000,api:3000 ./start.sh

# Environment variables automatically set:
# PORT=8000, PORT_WEB=8000, PORT_API=3000
```

## 💫 Command Reference

### Essential Commands (Daily Use)
```bash
neco <any-command>       # Zero-conflict execution
neco .                   # Auto-detect and start
neco stop                # Stop all services
```

### Port Management
```bash
neco ports               # List all ports in use
neco port 3000           # Check specific port
neco release 3000        # Free up a port
neco test 3000           # Test port availability
```

### Diagnostics & Debugging
```bash
neco doctor              # Full system diagnosis
neco ps                  # List neco processes
neco logs <service>      # View service logs
neco status              # System status
```

### Configuration
```bash
neco init                # Create .necoport.yaml
neco config              # Show current config
```

## 🚫 Common Issues & Solutions

### Port Conflicts
```bash
# Problem: "Port 3000 already in use"
# Solution: Just add neco!
neco python app.py       # Auto-assigns different port

# Manual resolution
neco ports               # See what's using ports
neco release 3000        # Free up specific port
```

### Environment Detection
```bash
# Problem: "Neco doesn't detect my project type"
# Solution: Use explicit commands or config
neco python manage.py runserver  # Explicit
neco init                        # Create config
```

### Proxy Issues
```bash
# Problem: "Can't access app on expected port"
# Solution: Check actual assigned ports
neco ps                  # See actual ports
neco logs <service>      # Check startup logs
```

## 🔍 Supported Project Types

### Programming Languages
- **Python**: Django, Flask, FastAPI, any Python server
- **Node.js**: Express, React, Vue, Angular, Next.js, Nuxt.js
- **Ruby**: Rails, Sinatra, any Ruby server
- **PHP**: Built-in server, Laravel, Symfony
- **Go**: Any Go web server
- **Java**: Spring Boot, any Java server
- **C#**: .NET, ASP.NET

### Frameworks & Tools
- **Docker**: docker-compose, container ports
- **Build Tools**: Webpack, Vite, Parcel, Rollup
- **Databases**: PostgreSQL, MySQL, Redis, MongoDB
- **Any CLI tool** that uses ports

### Auto-Detection Files
- `package.json` → npm/yarn scripts
- `requirements.txt` → Python projects
- `Gemfile` → Ruby projects
- `go.mod` → Go projects
- `docker-compose.yml` → Docker projects
- `Makefile` → Make targets
- `Procfile` → Heroku-style
- `.necoport.yaml` → Custom config

## 🔧 Limitations & Workarounds

### What Works Perfectly (99% of cases)
```bash
neco python app.py       # ✅ Single commands
neco npm run dev         # ✅ Package managers
neco docker-compose up   # ✅ Container orchestration
neco ./start.sh          # ✅ Shell scripts
```

### What Has Limitations
```bash
# ❌ Complex shell pipelines
neco python app.py | grep "started" | tee log.txt

# ✅ Workaround: Use scripts
echo 'python app.py | grep "started" | tee log.txt' > start.sh
neco ./start.sh

# ❌ Background processes
neco python app.py &

# ✅ Workaround: Use foreground execution
neco python app.py
```

## 📚 Integration Examples

### npm/package.json
```json
{
  "scripts": {
    "dev": "neco npm run start",
    "api": "neco node server.js",
    "test": "neco npm test"
  }
}
```

### Docker Compose
```yaml
version: '3.8'
services:
  web:
    build: .
    command: neco python app.py
    environment:
      - PORT=8000
  api:
    build: ./api
    command: neco node server.js
    environment:
      - PORT=3000
```

### VS Code Tasks
```json
{
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "shell",
      "command": "neco npm run dev"
    }
  ]
}
```

## 📦 Package Management

### Version Updates
```bash
# Check current version
neco --version

# Update to latest
npm update -g neco-porter

# Install specific version
npm install -g neco-porter@2.3.0
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `NECOPORTD_URL` | `http://localhost:5555` | Daemon URL |
| `PORT` | Auto-assigned | Primary port (set by neco) |

## 🚀 Performance & Reliability

- **Zero overhead** when ports don't conflict
- **Millisecond detection** of port issues
- **Automatic cleanup** when processes exit
- **Cross-platform** support (macOS, Linux, Windows)
- **Battle-tested** with thousands of port assignments

## 📝 Contributing

We welcome contributions! 

### Quick Start for Contributors
```bash
git clone https://github.com/R9a00/neco-porter.git
cd neco-porter
npm install
npm test
```

### Cat Guidelines
- Keep ASCII cats under 20 characters wide
- Test in various terminals
- Ensure they bring joy to developers 🐱

## 📜 License

MIT License - Cats (and code) roam free!

---

<div align="center">

**No more port conflicts. Ever.** 🎆

*Built with ❤️ and 🐾 by developers who got tired of port 3000 errors*

[GitHub](https://github.com/R9a00/neco-porter) • [npm](https://www.npmjs.com/package/neco-porter) • [Issues](https://github.com/R9a00/neco-porter/issues)

</div>
