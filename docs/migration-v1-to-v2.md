# Migration Guide: v1 to v2

## Overview

Neco Porter v2 is **100% backward compatible** with v1. You can upgrade at your own pace and adopt new features when ready.

## Key Points

✅ **No breaking changes** - All v1 commands and APIs work unchanged  
✅ **Automatic data migration** - State files upgrade automatically  
✅ **Gradual adoption** - Use v2 features only when needed  
✅ **Mix and match** - v1 and v2 clients can coexist  

## Installation

```bash
# Update to v2 (currently in beta)
npm install -g neco-porter@next

# Or from source
git clone https://github.com/R9a00/neco-porter.git
cd neco-porter
git checkout feature/v2-multi-port
npm install && npm link
```

## What Continues to Work

### CLI Commands
```bash
# These work exactly the same
necoport-client exec myapp npm run dev
necoport-client list
necoport-client reserve myservice
necoport-client release myservice
```

### Node.js API
```javascript
// This code needs no changes
const port = await reserve('myapp');
await release('myapp');

await withPort('myapp', async (port) => {
  // Your code
});
```

### Environment Variables
- `$PORT` continues to be set as before
- New ports get additional variables (`$PORT_API`, etc.)

## New Features You Can Use

### Multi-Port Reservation

#### CLI
```bash
# Reserve multiple named ports
necoport-client exec myapp --ports main,api,websocket npm run dev
# Sets: PORT=3001, PORT_API=3002, PORT_WEBSOCKET=3003

# Reserve N ports
necoport-client exec myapp --count 3 npm run dev
# Sets: PORT=3001, PORT_1=3002, PORT_2=3003
```

#### Node.js API
```javascript
// Named ports
const ports = await reserve('myapp', {
  ports: {
    main: { hint: 3000 },
    api: { hint: 8080 }
  }
});
// Returns: { main: 3001, api: 8081 }

// Count-based
const ports = await reserve('myapp', { count: 3 });
// Returns: { '0': 3001, '1': 3002, '2': 3003 }
```

## Common Migration Scenarios

### Scenario 1: Web App with HMR

**Before (manual port management):**
```json
{
  "scripts": {
    "dev": "PORT=3000 HMR_PORT=3001 vite"
  }
}
```

**After (automatic multi-port):**
```json
{
  "scripts": {
    "dev": "necoport-client exec myapp --ports main,hmr vite"
  }
}
```

```javascript
// vite.config.js
export default {
  server: {
    port: process.env.PORT,
    hmr: {
      port: process.env.PORT_HMR
    }
  }
}
```

### Scenario 2: Microservices

**Before (port conflicts):**
```bash
# Terminal 1
PORT=3000 npm run frontend  # Might conflict!

# Terminal 2  
PORT=8080 npm run backend   # Might conflict!
```

**After (guaranteed unique ports):**
```bash
# Terminal 1
necoport-client exec frontend --ports web,ws npm run frontend

# Terminal 2
necoport-client exec backend --ports api,grpc,metrics npm run backend
```

### Scenario 3: Full-Stack Development

**Before:**
```javascript
// Complex port management
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const BACKEND_PORT = process.env.BACKEND_PORT || 8080;
const DB_PORT = process.env.DB_PORT || 5432;
```

**After:**
```bash
necoport-client exec fullstack --ports frontend,backend,db npm run dev
```

```javascript
// Automatic from environment
const FRONTEND_PORT = process.env.PORT_FRONTEND;
const BACKEND_PORT = process.env.PORT_BACKEND;
const DB_PORT = process.env.PORT_DB;
```

## State File Migration

The v2 daemon automatically migrates v1 state files:

**v1 Format:**
```json
{
  "myapp": {
    "port": 3000,
    "pid": 12345,
    "expires": 1234567890
  }
}
```

**v2 Format (automatic):**
```json
{
  "myapp": {
    "port": 3000,
    "ports": {
      "main": {
        "port": 3000,
        "pid": 12345
      }
    },
    "pid": 12345,
    "expires": 1234567890,
    "version": "2.0.0"
  }
}
```

## Compatibility Matrix

| Component | v1 Client | v2 Client |
|-----------|-----------|-----------|
| v1 Daemon | ✅ Works | ⚠️ Single port only |
| v2 Daemon | ✅ Works | ✅ Full features |

## Best Practices

1. **Start Simple**: Upgrade the package but keep using v1 commands
2. **Test First**: Try v2 features in development before production
3. **Gradual Migration**: Convert one service at a time
4. **Document Ports**: Use meaningful names (main, api, metrics)

## Troubleshooting

### "Unknown option: --ports"
You're using v1 client with v2 syntax. Update: `npm install -g neco-porter@next`

### Ports not set correctly
Check environment variables are read correctly:
```bash
necoport-client exec test --ports a,b,c bash -c 'env | grep PORT'
```

### State file errors
Delete and let v2 recreate: `rm ~/.necoportd.json`

## Getting Help

- 📖 [Full v2 Documentation](../README-v2.md)
- 🐛 [Report Issues](https://github.com/R9a00/neco-porter/issues)
- 💬 [Discussions](https://github.com/R9a00/neco-porter/discussions)

---

Remember: **You don't have to migrate everything at once!** Neco Porter v2 is designed to work alongside v1, allowing gradual adoption. 🐱