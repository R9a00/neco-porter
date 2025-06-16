# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-01-16

### Added
- 🧠 **Advanced environment variable detection** - Identifies custom PORT variables (e.g., DASHBOARD_PORT)
- 🎯 **Smart code analysis** - Detects `process.env.CUSTOM_PORT || 3000` patterns  
- 💡 **Precise fix suggestions** - Provides exact code changes needed
- 🔍 **Root cause identification** - Shows exactly why apps ignore PORT variable

### Enhanced
- Port mismatch warnings now show detected environment variable patterns
- More accurate problem diagnosis with specific variable names

### Example Output
```
🔍 Detected app listens on: process.env.DASHBOARD_PORT || 3000
⚠️  This app doesn't use PORT variable!
💡 Consider: process.env.PORT || process.env.DASHBOARD_PORT || 3000
```

## [2.1.0] - 2025-01-16

### Added
- 🔧 **Environment variable debug logging** - Shows which PORT variables are set
- ⚠️ **Port mismatch detection** - Warns when app uses hardcoded ports instead of process.env.PORT
- 💡 **Smart code analysis** - Automatically detects hardcoded ports in source files
- 🎯 **Helpful suggestions** - Provides specific code examples to fix port conflicts

### Changed
- Enhanced error messages with actionable advice
- Better debugging information for troubleshooting port issues

## [2.0.1] - 2025-01-16

### Added
- 🚀 **Auto-start daemon** - `neco` command now automatically starts necoportd if not running
- No manual daemon setup required anymore!

### Fixed
- Status command routing when using config file lookup

## [2.0.0] - 2025-01-16

### Added
- 🧠 **Smart Auto-Detection** - Just run `neco .` in any project directory
- 🎯 **Unified `neco` command** - Single command replaces complex CLI
- 📁 **Hierarchical config search** - Finds `.necoport.yaml` in parent directories
- 🚀 **Built-in launcher** - Process management with auto-restart capabilities
- 🔍 **Project type detection** - Automatically detects Python, Node.js, Ruby, Go, Docker, etc.
- ⚡ **Command-line options** - `--ports` and `--env` flags for quick configuration
- 📋 **Application profiles** - Pre-configured settings for common frameworks
- 🎉 **Multi-port support** - Reserve and manage multiple ports per application
- 📛 **Named ports** - Organize ports by purpose (e.g., main, api, websocket)
- 🔢 **Count-based allocation** - Reserve N ports with `--count` flag
- 🔄 **Full backward compatibility** - v1 clients work seamlessly with v2 daemon
- 📊 **Enhanced status command** - Shows all running services and ports
- 🔌 **New API endpoints** - `/ports/:name` for service-specific queries
- 📝 **TypeScript support** - Complete type definitions for v2 features
- 🚀 **GitHub Actions** - CI/CD pipeline for testing and releases

### Changed
- **Simplified usage** - No need to know app startup commands
- **Smart defaults** - Auto-detects Procfile, Makefile, package.json scripts
- Database format now supports multiple ports per service (auto-migrates from v1)
- Environment variables: `PORT_<NAME>` for additional ports
- Improved error messages with helpful suggestions
- Better documentation with real-world examples

### Fixed
- macOS bash compatibility issues (removed associative arrays)
- Port allocation now stays within configured range
- Port conflicts in complex multi-service environments
- Process cleanup for multi-port allocations
- Heartbeat handling for long-running services

## [2.0.0-beta.1] - 2025-01-16

### Added
- Initial beta release of v2 features
- Multi-port support foundation
- Basic auto-detection capabilities

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

---

## Upgrade Guide

### From v1 to v2

v2 is designed to be simpler while maintaining full backward compatibility:

1. **Update the package**:
   ```bash
   npm install -g neco-porter@latest
   ```

2. **Start using the new `neco` command**:
   ```bash
   # Old way (still works)
   necoport-client exec myapp npm run dev
   
   # New way (auto-detect)
   cd my-project
   neco .
   
   # New way (with options)
   neco --ports main:8000,api:8001 python app.py
   ```

3. **Daemon upgrades automatically** - The v2 daemon migrates v1 state files on startup

### What's Different in v2?

**For new users**: Just use `neco .` - it figures out everything else!

**For v1 users**: All your existing commands still work. The new features are optional.

### API Changes

All v1 API calls continue to work. New v2 features are additive:

```javascript
// v1 (still supported)
const port = await reserve('myapp');

// v2 (new features)
const ports = await reserve('myapp', { 
  ports: { main: {}, api: {} } 
});
```