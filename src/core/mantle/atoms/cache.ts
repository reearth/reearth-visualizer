import { atom } from "jotai";

export function cacheAtom<K, T>() {
  const map = atom<Map<K, T> | undefined>(undefined);

  const get = atom(get => (key: K) => get(map)?.get(key));

  const set = atom(null, (get, set, value: { key: K; value?: T }) => {
    const m = get(map) ?? new Map();
    if (typeof value.value === "undefined") {
      m.delete(value.key);
    } else {
      m.set(value.key, value.value);
    }
    set(map, m);
  });

  return { get, set };
}

export function doubleKeyCacheAtom<K, L, T>() {
  const map = atom<Map<K, Map<L, T>> | undefined>(undefined);

  const get = atom(get => (key: K, key2: L) => get(map)?.get(key)?.get(key2));

  const getAll = atom(get => (key: K) => {
    const m = get(map)?.get(key);
    if (!m) return undefined;

    const res: T[] = [];
    for (const k of m.keys()) {
      const v = m.get(k);
      if (typeof v === "undefined") continue;
      res.push(v);
    }
    return res;
  });

  const set = atom(null, (get, set, value: { key: K; key2: L; value?: T }) => {
    const m: Map<K, Map<L, T>> = get(map) ?? new Map();
    const n = m.get(value.key) ?? new Map();
    if (typeof value.value === "undefined") {
      n?.delete(value.key2);
      if (n?.size === 0) {
        m.delete(value.key);
      }
    } else {
      n.set(value.key2, value.value);
      m.set(value.key, n);
    }
    set(map, m);
  });

  return { get, set, getAll };
}
