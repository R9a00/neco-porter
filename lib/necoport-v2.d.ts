// TypeScript definitions for Neco Porter v2

export interface PortReservation {
  name: string;
  port: number;
  ports?: Record<string, number>;
  cat: string;
  expires: number;
  pid?: number;
  alive: boolean;
}

export interface PortConfig {
  hint?: number;
}

export interface ReserveOptions {
  // For named ports
  ports?: Record<string, PortConfig>;
  // For count-based reservation  
  count?: number;
  // Lease time in seconds
  lease?: number;
}

// Single port reservation (v1 compatibility)
export function reserve(name: string, hint?: number): Promise<number>;

// Multi-port reservation (v2)
export function reserve(name: string, options: ReserveOptions): Promise<Record<string, number>>;

// Release all ports for a service
export function release(name: string): Promise<void>;

// Release specific port (v2)
export function release(name: string, portName: string): Promise<void>;

// List all reservations
export function list(): Promise<PortReservation[]>;

// Get ports for specific service (v2)
export function getPorts(name: string): Promise<Record<string, number> | null>;

// With single port (v1 compatibility)
export function withPort<T>(
  name: string,
  callback: (port: number) => Promise<T>,
  hint?: number
): Promise<T>;

// With multiple ports (v2)
export function withPort<T>(
  name: string,
  callback: (ports: Record<string, number>) => Promise<T>,
  options: ReserveOptions
): Promise<T>;

// v2 specific namespace
export namespace v2 {
  export function reserveMulti(name: string, options: ReserveOptions): Promise<Record<string, number>>;
  export function getPorts(name: string): Promise<Record<string, number> | null>;
}