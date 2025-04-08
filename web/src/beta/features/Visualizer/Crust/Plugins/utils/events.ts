import EventTarget from "@ungap/event-target";
import { useEffect } from "react";

export type EventCallback<T extends any[] = any[]> = (...args: T) => void;
export type EventEmitter<
  E extends { [P in string]: any[] } = { [P in string]: any[] }
> = <T extends keyof E>(type: T, ...args: E[T]) => void;

export type Events<
  E extends { [P in string]: any[] } = { [P in string]: any[] }
> = {
  readonly on: <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]>
  ) => void;
  readonly off: <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]>
  ) => void;
  readonly once: <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]>
  ) => void;
};

export function events<
  E extends { [P in string]: any[] } = { [P in string]: any[] }
>(): [Events<E>, EventEmitter<E>] {
  const e = new EventTarget();
  // Map to store event listeners by type and ID
  const callbacks = new Map<string, Map<number, EventCallback>>();

  let callbackId = 0;

  // Get a unique ID for each callback
  const getEventCallback = <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]>
  ): number => {
    let ecbs = callbacks.get(String(type));
    if (!ecbs) {
      ecbs = new Map();
      callbacks.set(String(type), ecbs);
    }

    const id = callbackId++; // Generate a unique ID
    ecbs.set(id, callback);
    return id;
  };

  // Remove an event listener by its ID
  const deleteEventCallback = (type: string, id: number): void => {
    const ecbs = callbacks.get(type);

    if (ecbs) {
      const callback = ecbs.get(id);
      if (callback) {
        e.removeEventListener(type, callback);
        ecbs.delete(id);
      }
    }
  };
  const on = <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => {
    const id = getEventCallback(type, callback);

    const ecb = (e: Event) => {
      callback(...(e as CustomEvent).detail);
    };

    e.addEventListener(String(type), ecb);
    return id;
  };

  const off = <T extends keyof E>(type: T, id: number) => {
    deleteEventCallback(String(type), id);
  };

   const once = <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => {
     const id = getEventCallback(type, callback);

     const ecb = (e: Event) => {
       callback(...(e as CustomEvent).detail);
     };

     e.addEventListener(String(type), ecb, { once: true });
     return id;
   };


  const events = {
    get on() {
      return on;
    },
    get off() {
      return off;
    },
    get once() {
      return once;
    }
  };

  return [
    events,
    <T extends keyof E>(type: T, ...args: E[T]) =>
      e.dispatchEvent(new CustomEvent(String(type), { detail: args }))
  ];
}

export function mergeEvents<
  E extends Record<string, any[]> = Record<string, any[]>
>(source: Events<E>, dest: EventEmitter<E>, types: (keyof E)[]): () => void {
  const cbs = types.reduce<{ [T in keyof E]: EventCallback<E[T]> }>((a, b) => {
    a[b] = (...args: E[typeof b]) => {
      dest(b, ...args);
    };
    return a;
  }, {} as any);

  for (const t of Object.keys(cbs)) {
    source.on(t, cbs[t]);
  }

  return () => {
    for (const t of Object.keys(cbs)) {
      source.off(t, cbs[t]);
    }
  };
}

export function useEmit<T extends { [K in string]: any[] }>(
  values: { [K in keyof T]?: T[K] | undefined },
  emit: (<K extends keyof T>(key: K, ...args: T[K]) => void) | undefined
) {
  useEffect(() => {
    if (!emit) return;

    for (const k in values) {
      const args = values[k];
      if (args) {
        emit(k, ...args);
      }
    }
  }, [emit, values]);
}
