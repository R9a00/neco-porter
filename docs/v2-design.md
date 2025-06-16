# Neco Porter v2.0 Design Document

## Overview

Neco Porter v2.0 introduces multi-port management capabilities while maintaining full backward compatibility with v1.x. This allows applications to reserve and manage multiple related ports as a group.

## Key Features

### 1. Multi-Port Reservation
- Reserve multiple ports with a single request
- Named ports for easy identification (e.g., "api", "websocket", "metrics")
- Automatic port grouping and lifecycle management

### 2. Configuration File Support
- `.necoportrc.yml` for project-specific port configurations
- Port hints and dependencies
- Shareable across team members

### 3. Automatic Port Detection
- Detect ports opened by child processes
- Automatic reservation of detected ports
- Prevention of conflicts between applications

## API Design

### Backward Compatible Changes

#### POST /reserve

**v1 Request (still supported):**
```json
{
  "name": "myapp",
  "hint": 3000,
  "lease": 600,
  "pid": 12345
}
```

**v1 Response (still returned):**
```json
{
  "port": 3001,
  "lease": 600
}
```

**v2 Request (new options):**
```json
{
  "name": "myapp",
  "ports": {
    "main": { "hint": 3000 },
    "api": { "hint": 8080 },
    "metrics": { "hint": 9090 }
  },
  "lease": 600,
  "pid": 12345
}
```

**v2 Response (includes v1 fields):**
```json
{
  "port": 3001,              // For v1 compatibility
  "ports": {                 // New in v2
    "main": 3001,
    "api": 8081,
    "metrics": 9091
  },
  "lease": 600
}
```

### New Endpoints

#### POST /reserve-multi
Dedicated endpoint for multi-port reservation with advanced features.

#### GET /ports/:name
Get all ports associated with a service name.

## Data Model Changes

### v1 Data Structure
```javascript
{
  "myapp": {
    "port": 3000,
    "pid": 12345,
    "expires": 1234567890
  }
}
```

### v2 Data Structure
```javascript
{
  "myapp": {
    "port": 3000,           // Kept for backward compatibility
    "ports": {              // New in v2
      "main": {
        "port": 3000,
        "pid": 12345
      },
      "api": {
        "port": 8080,
        "pid": 12345
      }
    },
    "pid": 12345,           // Main process ID
    "expires": 1234567890,
    "version": "2.0.0"      // Schema version
  }
}
```

## Client Changes

### CLI Usage

**v1 (still works):**
```bash
necoport-client exec myapp npm run dev
# Sets: PORT=3001
```

**v2 (new capabilities):**
```bash
# Reserve multiple ports
necoport-client exec myapp --ports main,api,metrics npm run dev
# Sets: PORT=3001, PORT_API=3002, PORT_METRICS=3003

# With hints
necoport-client exec myapp --ports main:3000,api:8080 npm run dev

# Using count
necoport-client exec myapp --count 3 npm run dev
# Sets: PORT=3001, PORT_1=3002, PORT_2=3003
```

### Node.js API

**v1 (still works):**
```javascript
const port = await reserve('myapp');
```

**v2 (new overloads):**
```javascript
// Reserve multiple named ports
const ports = await reserve('myapp', {
  ports: {
    main: { hint: 3000 },
    api: { hint: 8080 },
    metrics: { hint: 9090 }
  }
});
// Returns: { main: 3001, api: 8081, metrics: 9091 }

// Reserve by count
const ports = await reserve('myapp', { count: 3 });
// Returns: { 0: 3001, 1: 3002, 2: 3003 }

// Using withPort
await withPort('myapp', async (ports) => {
  console.log(ports.main);    // 3001
  console.log(ports.api);     // 8081
}, { ports: { main: {}, api: {} } });
```

## Configuration File Format

`.necoportrc.yml`:
```yaml
version: 2
services:
  myapp:
    ports:
      main:
        hint: 3000
        required: true
      api:
        hint: 8080
      metrics:
        hint: 9090
        
  database:
    ports:
      main:
        hint: 5432
      replica:
        hint: 5433
        
defaults:
  lease: 3600
  strategy: sequential  # or 'random'
```

## Migration Strategy

### Automatic Migration
- On daemon startup, detect v1 data format
- Convert to v2 format preserving all data
- Mark with version field

### Zero Downtime
- v1 clients continue to work with v2 daemon
- v2 clients work with v1 daemon (degraded to single port)
- Gradual adoption possible

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Update data models with backward compatibility
- [ ] Implement multi-port reservation in daemon
- [ ] Add database migration logic
- [ ] Update core API endpoints

### Phase 2: Client Libraries (Week 2)
- [ ] Update Node.js client library
- [ ] Update bash client with new flags
- [ ] Add TypeScript definitions
- [ ] Implement environment variable mapping

### Phase 3: Configuration Support (Week 3)
- [ ] Parse .necoportrc.yml files
- [ ] Implement configuration resolution
- [ ] Add project-level defaults
- [ ] Create configuration examples

### Phase 4: Advanced Features (Week 4)
- [ ] Port detection/monitoring
- [ ] Cross-service discovery
- [ ] Port templates/profiles
- [ ] Performance optimizations

### Phase 5: Testing & Documentation (Week 5)
- [ ] Comprehensive test suite
- [ ] Migration testing
- [ ] Update all documentation
- [ ] Create migration guide

## Success Criteria

1. **100% backward compatibility** - No v1 client breaks
2. **Performance** - Multi-port reservation < 50ms
3. **Reliability** - No port conflicts in stress tests
4. **Adoption** - Clear migration path with examples
5. **Developer Experience** - Intuitive API design

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking v1 clients | Extensive compatibility testing |
| Complex migration | Automatic migration tools |
| Performance degradation | Benchmark before/after |
| User confusion | Clear documentation and examples |

## Future Considerations

- Port namespaces for multi-tenant scenarios
- Integration with container orchestration
- REST API v2 with GraphQL consideration
- Plugin system for custom port allocation strategies