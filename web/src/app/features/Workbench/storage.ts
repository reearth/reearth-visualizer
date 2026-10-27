import { STORAGE_PREFIX } from "./constants";

// localStorage can be missing or full; the workbench still works without it,
// it just doesn't remember.

const key = (name: string) => `${STORAGE_PREFIX}:${name}`;

export function loadJson<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(name));
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveJson(name: string, value: unknown) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // storage unavailable: the choice lasts until reload
  }
}

export const saveString = (name: string, value: string) => {
  try {
    localStorage.setItem(key(name), value);
  } catch {
    // see above
  }
};
