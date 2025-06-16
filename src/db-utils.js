// Database utilities for v2 with backward compatibility

export const DB_VERSION = '2.0.0';

/**
 * Migrate v1 database format to v2
 * @param {Object} db - Database object
 * @returns {Object} - Migrated database
 */
export function migrateDatabase(db) {
  if (!db || typeof db !== 'object') {
    return {};
  }

  const migrated = {};
  
  for (const [name, data] of Object.entries(db)) {
    // Skip if already v2 format
    if (data.version === DB_VERSION) {
      migrated[name] = data;
      continue;
    }
    
    // Migrate v1 to v2 format
    if (typeof data.port === 'number') {
      migrated[name] = {
        port: data.port,  // Keep for backward compatibility
        ports: {
          main: {
            port: data.port,
            pid: data.pid
          }
        },
        pid: data.pid,
        expires: data.expires,
        version: DB_VERSION
      };
    }
  }
  
  return migrated;
}

/**
 * Create a v2 reservation entry
 * @param {Object} options - Reservation options
 * @returns {Object} - Database entry
 */
export function createReservation(options) {
  const { ports, pid, expires } = options;
  
  // Single port (v1 style)
  if (typeof ports === 'number') {
    return {
      port: ports,
      ports: {
        main: {
          port: ports,
          pid
        }
      },
      pid,
      expires,
      version: DB_VERSION
    };
  }
  
  // Multi-port (v2 style)
  const portMap = {};
  let mainPort = null;
  
  for (const [name, port] of Object.entries(ports)) {
    portMap[name] = {
      port,
      pid
    };
    if (name === 'main' || !mainPort) {
      mainPort = port;
    }
  }
  
  return {
    port: mainPort,  // First port for v1 compatibility
    ports: portMap,
    pid,
    expires,
    version: DB_VERSION
  };
}

/**
 * Get ports from a reservation (v1 or v2)
 * @param {Object} reservation - Database entry
 * @returns {Object} - Port map
 */
export function getPortsFromReservation(reservation) {
  if (!reservation) return {};
  
  // v2 format
  if (reservation.ports) {
    const result = {};
    for (const [name, data] of Object.entries(reservation.ports)) {
      result[name] = data.port;
    }
    return result;
  }
  
  // v1 format
  if (typeof reservation.port === 'number') {
    return { main: reservation.port };
  }
  
  return {};
}

/**
 * Check if all processes for a reservation are alive
 * @param {Object} reservation - Database entry
 * @param {Function} isAlive - Function to check process
 * @returns {boolean}
 */
export function isReservationAlive(reservation, isAlive) {
  if (!reservation) return false;
  
  // Check main process
  if (reservation.pid && !isAlive(reservation.pid)) {
    return false;
  }
  
  // Check individual port processes (v2)
  if (reservation.ports) {
    for (const portData of Object.values(reservation.ports)) {
      if (portData.pid && !isAlive(portData.pid)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Clean dead processes from reservation
 * @param {Object} reservation - Database entry
 * @param {Function} isAlive - Function to check process
 * @returns {Object|null} - Cleaned reservation or null if all dead
 */
export function cleanDeadProcesses(reservation, isAlive) {
  if (!reservation) return null;
  
  // v2 format with ports
  if (reservation.ports) {
    const alivePorts = {};
    let hasAlive = false;
    
    for (const [name, data] of Object.entries(reservation.ports)) {
      if (!data.pid || isAlive(data.pid)) {
        alivePorts[name] = data;
        hasAlive = true;
      }
    }
    
    if (!hasAlive) return null;
    
    return {
      ...reservation,
      ports: alivePorts
    };
  }
  
  // v1 format
  if (!reservation.pid || isAlive(reservation.pid)) {
    return reservation;
  }
  
  return null;
}