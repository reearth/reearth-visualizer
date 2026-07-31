// Copies all property descriptors (including getters) from source as own
// properties on a new object, overriding only the specified keys with plain
// values. This preserves lazy evaluation of source getters (e.g. layers.layers,
// camera.position) which would otherwise be evaluated once and captured as
// static snapshots if using object spread ({ ...source }).
export function copyWithOverrides<T extends object>(
  source: T,
  overrides: Partial<Record<string, unknown>>
): T {
  const descriptors: Record<string, PropertyDescriptor> = {};
  const sourceDescs = Object.getOwnPropertyDescriptors(source);
  for (const key of Object.keys(sourceDescs)) {
    descriptors[key] = sourceDescs[key];
  }
  for (const key of Object.keys(overrides)) {
    descriptors[key] = {
      value: (overrides as Record<string, unknown>)[key],
      writable: true,
      enumerable: true,
      configurable: true
    };
  }
  return Object.defineProperties({}, descriptors as PropertyDescriptorMap) as T;
}
