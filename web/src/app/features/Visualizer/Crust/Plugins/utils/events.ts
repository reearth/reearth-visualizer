import EventTarget from "@ungap/event-target";
import { useEffect } from "react";

import { getFunctionFingerprintString } from "./fingerprint";

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
  const callbacks = new Map<keyof E, Map<string, (e: Event) => void>>();

  const getEventCallback = <T extends keyof E>(
    type: T,
    cb: EventCallback<E[T]>,
    ignoreExisting = false
  ): ((e: Event) => void) => {
    const fingerprint = getFunctionFingerprintString(cb);
    let ecbs = callbacks.get(type);
    if (!ecbs) {
      ecbs = new Map();
      callbacks.set(type, ecbs);
    }

    let ecb = ecbs.get(fingerprint);
    if (!ecb || ignoreExisting) {
      ecb = (e: Event): void => {
        cb(...(e as CustomEvent).detail);
      };
      ecbs.set(fingerprint, ecb);
    }

    return ecb;
  };

  const deleteEventCallback = (type: keyof E, cb: EventCallback): void => {
    const ecbs = callbacks.get(type);
    const fingerprint = getFunctionFingerprintString(cb);
    if (ecbs) {
      ecbs.delete(fingerprint);
      if (ecbs.size === 0) {
        callbacks.delete(type);
      }
    }
  };

  const on = <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => {
    const ecb = getEventCallback(type, callback, true);
    e.addEventListener(String(type), ecb);
  };
  const off = <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => {
    const ecb = getEventCallback(type, callback);
    e.removeEventListener(String(type), ecb);
    deleteEventCallback(type, ecb);
  };
  const once = <T extends keyof E>(type: T, callback: EventCallback<E[T]>) => {
    const ecb = getEventCallback(type, callback, true);
    e.addEventListener(String(type), ecb, { once: true });
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
  for (const k of Object.keys(values)) {
    const args = values[k];
    // TODO: fix this
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!args) return;
      emit?.(k, ...args);
    }, [emit, k, args]);
  }
}
