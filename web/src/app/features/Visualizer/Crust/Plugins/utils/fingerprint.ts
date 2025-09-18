/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * Generates a consistent fingerprint for functions that remains stable
 * even after functions are marshaled/unmarshaled through QuickJS.
 *
 * This is useful for scenarios like addEventListener/removeEventListener
 * where you need to identify the same logical function even though
 * different JavaScript wrapper objects are created each time.
 */

export interface FunctionFingerprint {
  name: string;
  source: string;
  length: number;
  hash: string;
}

/**
 * Simple hash function for strings (djb2 algorithm)
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36); // Convert to base36 for shorter string
}

/**
 * Generate a fingerprint object for a function
 */
export function getFunctionFingerprint(fn: Function): FunctionFingerprint {
  const name = fn.name || "";
  const source = fn.toString();
  const length = fn.length;

  // Create a composite hash from all properties
  const composite = `${name}|${source}|${length}`;
  const hash = hashString(composite);

  return {
    name,
    source,
    length,
    hash
  };
}

/**
 * Generate a simple string fingerprint for a function
 * This is the most convenient form for use as a Map key
 */
export function getFunctionFingerprintString(fn: Function): string {
  const fingerprint = getFunctionFingerprint(fn);
  return fingerprint.hash;
}

/**
 * Compare two functions by their fingerprints
 */
export function areFunctionsSame(fn1: Function, fn2: Function): boolean {
  const fp1 = getFunctionFingerprint(fn1);
  const fp2 = getFunctionFingerprint(fn2);

  return fp1.hash === fp2.hash;
}

/**
 * Enhanced event listener system using function fingerprints
 * This solves the function identity problem for QuickJS functions
 */
export class FingerprintEventSystem {
  private listeners = new Map<string, Map<string, Function>>();

  /**
   * Add an event listener using function fingerprint for identification
   */
  addEventListener(
    event: string,
    handler: Function,
    customFingerprint?: string
  ): string {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Map());
    }

    const fingerprint =
      customFingerprint || getFunctionFingerprintString(handler);
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.set(fingerprint, handler);
    }

    return fingerprint;
  }

  /**
   * Remove an event listener by fingerprint
   */
  removeEventListener(event: string, fingerprint: string): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return false;

    return eventListeners.delete(fingerprint);
  }

  /**
   * Remove an event listener by function (automatically generates fingerprint)
   */
  removeEventListenerByFunction(event: string, handler: Function): boolean {
    const fingerprint = getFunctionFingerprintString(handler);
    return this.removeEventListener(event, fingerprint);
  }

  /**
   * Dispatch an event to all registered listeners
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatchEvent(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    for (const handler of eventListeners.values()) {
      try {
        handler(...args);
      } catch (error) {
        console.error("Error in event handler:", error);
      }
    }
  }

  /**
   * Get count of listeners for an event
   */
  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Clear all listeners for an event
   */
  clearEventListeners(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Clear all listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
  }
}
