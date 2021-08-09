export type EventCallback = (...args: any[]) => void;
export type EventEmitter = (type: string, ...args: any[]) => void;

export type Events = {
  readonly on: (type: string, callback: EventCallback) => void;
  readonly off: (type: string, callback: EventCallback) => void;
  readonly once: (type: string, callback: EventCallback) => void;
};

export default function events(): [
  Events,
  EventEmitter,
  (name: string) => [() => EventCallback | undefined, (callback?: EventCallback) => void],
] {
  const e = new EventTarget();
  const callbacks = new Map<string, Map<EventCallback, (e: Event) => void>>();
  const getEventCallback = (type: string, cb: EventCallback): ((e: Event) => void) => {
    let ecbs = callbacks.get(type);
    if (!ecbs) {
      ecbs = new Map();
      callbacks.set(type, ecbs);
    }

    let ecb = ecbs.get(cb);
    if (!ecb) {
      ecb = (e: Event): void => {
        cb(...(e as CustomEvent).detail);
      };
      ecbs.set(cb, ecb);
    }

    return ecb;
  };
  const deleteEventCallback = (type: string, cb: EventCallback): void => {
    callbacks.get(type)?.delete(cb);
  };

  const on = (type: string, callback: EventCallback) => {
    const ecb = getEventCallback(type, callback);
    e.addEventListener(type, ecb);
  };
  const off = (type: string, callback: EventCallback) => {
    const ecb = getEventCallback(type, callback);
    e.removeEventListener(type, ecb);
    deleteEventCallback(type, ecb);
  };
  const once = (type: string, callback: EventCallback) => {
    const ecb = getEventCallback(type, callback);
    e.addEventListener(type, ecb, { once: true });
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
    },
  };

  return [
    events,
    (type: string, ...args: any[]) => e.dispatchEvent(new CustomEvent(type, { detail: args })),
    (name: string) => eventFn(name, events),
  ];
}

function eventFn(
  name: string,
  e: Events,
): [() => EventCallback | undefined, (callback?: EventCallback) => void] {
  let cb: EventCallback | undefined;
  return [
    () => cb,
    (value?: EventCallback) => {
      if (typeof cb === "function") {
        e.off(name, cb);
        cb = undefined;
      }
      if (value) {
        cb = value;
        e.on(name, value);
      }
    },
  ];
}
