# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-beta.1] - 2025-01-16

### Added
- 🎯 **Multi-port support** - Reserve and manage multiple ports per application
- 📛 **Named ports** - Organize ports by purpose (e.g., main, api, websocket)
- 🔢 **Count-based allocation** - Reserve N ports with `--count` flag
- 🔄 **Full backward compatibility** - v1 clients work seamlessly with v2 daemon
- 📊 **Enhanced list command** - Shows all ports per service
- 🔌 **New API endpoints** - `/ports/:name` for service-specific queries
- 📝 **TypeScript support** - Complete type definitions for v2 features
- 🚀 **GitHub Actions** - CI/CD pipeline for testing and releases

### Changed
- Database format now supports multiple ports per service (auto-migrates from v1)
- Environment variables: `PORT_<NAME>` for additional ports
- Client supports new `--ports` and `--count` flags
- List command shows hierarchical port information

### Fixed
- Port conflicts in complex multi-service environments
- Process cleanup for multi-port allocations
- Heartbeat handling for long-running services

## [1.0.0] - 2025-01-13

### Added
- 🐱 Initial release of Neco Porter
- Single port allocation per service
- Automatic port conflict resolution
- Process-based lifecycle management
- Cat ASCII art for every port assignment
- Support for any language/framework via environment variables
- Bash client with exec, list, reserve, release commands
- Node.js client library with Promise-based API
- Heartbeat mechanism for long-running processes
- Persistent state across daemon restarts

### Features
- Port range configuration (default: 3000-3999)
- Automatic cleanup on process termination
- 10-minute default lease time
- jq-based CLI for rich output
- Zero configuration required

## [0.1.0] - 2025-01-10 (Pre-release)

### Added
- Proof of concept implementation
- Basic daemon functionality
- Simple CLI client

---

## Upgrade Guide

### From v1 to v2

No action required! v2 is fully backward compatible:

1. **Update the package**:
   ```bash
   npm install -g neco-porter@next
   ```

2. **Restart daemon** (optional - v1 daemon works with v2 clients):
   ```bash
   pkill necoportd
   necoportd &
   ```

3. **Start using v2 features** when ready:
   ```bash
   # Old way (still works)
   necoport-client exec myapp npm run dev
   
   # New way (multi-port)
   necoport-client exec myapp --ports main,api,ws npm run dev
   ```

### Database Migration

The v2 daemon automatically migrates v1 state files on startup. No manual intervention needed!

### API Changes

All v1 API calls continue to work. New v2 features are additive:

```javascript
// v1 (still supported)
const port = await reserve('myapp');

// v2 (new feature)
const ports = await reserve('myapp', { 
  ports: { main: {}, api: {} } 
});
```