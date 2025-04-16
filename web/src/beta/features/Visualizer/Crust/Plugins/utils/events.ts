import EventTarget from "@ungap/event-target";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

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
  ) => string;
  readonly off: <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]> | string
  ) => void;
  readonly once: <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]>
  ) => string;
};

export function events<
  E extends { [P in string]: any[] } = { [P in string]: any[] }
>(): [Events<E>, EventEmitter<E>] {
  const e = new EventTarget();

  const callbacks = new Map<keyof E, Map<string, (e: Event) => void>>();

  const fnToId = new WeakMap<EventCallback, string>();

  const addEvent = <T extends keyof E>(
    type: T,
    cb: EventCallback<E[T]>,
    options?: AddEventListenerOptions
  ): string => {
    let id = fnToId.get(cb);
    if (!id) {
      id = uuidv4();
      fnToId.set(cb, id);
    }

    let ecbs = callbacks.get(type);
    if (!ecbs) {
      ecbs = new Map();
      callbacks.set(type, ecbs);
    }

    if (!ecbs.has(id)) {
      const wrapped = (event: Event) => {
        cb(...(event as CustomEvent).detail);
      };
      ecbs.set(id, wrapped);
      e.addEventListener(String(type), wrapped, options);
    }
    console.log("created id", type, id);
    return id;
  };

  const removeEvent = <T extends keyof E>(
    type: T,
    cbOrId: EventCallback<E[T]> | string
  ) => {
    let id: string | undefined;

    if (typeof cbOrId === "string") {
      id = cbOrId;
    } else {
      id = fnToId.get(cbOrId);
    }

    if (!id) return;

    const ecbs = callbacks.get(type);
    const listener = ecbs?.get(id);
    console.log("ecbs befor", ecbs);

    if (listener) {
      e.removeEventListener(String(type), listener);
      ecbs?.clear();
    }

    if (ecbs?.size === 0) {
      callbacks.delete(type);
    }
    console.log("ecbs after", ecbs);
  };

  const on = <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]>
  ): string => addEvent(type, callback);

  const off = <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]> | string
  ) => removeEvent(type, callback);

  const once = <T extends keyof E>(
    type: T,
    callback: EventCallback<E[T]>
  ): string => addEvent(type, callback, { once: true });

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

  const emit: EventEmitter<E> = <T extends keyof E>(type: T, ...args: E[T]) => {
    return e.dispatchEvent(new CustomEvent(String(type), { detail: args }));
  };

  return [events, emit];
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

export function useEmit<T extends Record<string, any[]>>(
  values: { [K in keyof T]?: T[K] },
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
