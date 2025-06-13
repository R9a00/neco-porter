/**
 * Neco Porter - TypeScript Definitions
 * Port management service where cats deliver your ports!
 */

/**
 * Reserve a port for a service
 * @param name - Service name
 * @param hint - Preferred port number (optional)
 * @returns Promise resolving to the assigned port number
 */
export function reserve(name: string, hint?: number): Promise<number>;

/**
 * Release a reserved port
 * @param name - Service name
 * @returns Promise resolving when port is released
 */
export function release(name: string): Promise<void>;

/**
 * Port reservation information
 */
export interface PortReservation {
  /** Service name */
  name: string;
  /** Assigned port number */
  port: number;
  /** Expiration timestamp */
  expires: number;
  /** Process ID */
  pid?: number;
  /** Cat ASCII art for this port */
  cat: string;
  /** Whether the process is still alive */
  alive?: boolean;
}

/**
 * Get list of all reserved ports
 * @returns Promise resolving to array of port reservations
 */
export function list(): Promise<PortReservation[]>;

/**
 * Reserve a port, run a callback, then release
 * @param name - Service name
 * @param callback - Async function that receives the port number
 * @param hint - Preferred port number (optional)
 * @returns Promise resolving to the callback's return value
 */
export function withPort<T>(
  name: string,
  callback: (port: number) => Promise<T>,
  hint?: number
): Promise<T>;