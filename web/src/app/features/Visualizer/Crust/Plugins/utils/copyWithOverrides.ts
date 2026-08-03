// Copies all property descriptors (including getters) from source as own
// properties on a new object, overriding only the specified keys with plain
// values. This preserves lazy evaluation of source getters (e.g. layers.layers,
// camera.position) which would otherwise be evaluated once and captured as
// static snapshots if using object spread ({ ...source }).
export function copyWithOverrides<T extends object>(
  source: T | undefined | null,
  overrides: Partial<Record<PropertyKey, unknown>>
): T {
  const descriptors: Record<PropertyKey, PropertyDescriptor> = {};
  const sourceDescs = Object.getOwnPropertyDescriptors(source ?? {});
  for (const key of Reflect.ownKeys(sourceDescs)) {
    descriptors[key] = sourceDescs[key as string];
  }
  for (const key of Reflect.ownKeys(overrides)) {
    descriptors[key] = {
      value: (overrides as Record<PropertyKey, unknown>)[key],
      writable: true,
      enumerable: true,
      configurable: true
    };
  }
  return Object.defineProperties({}, descriptors as PropertyDescriptorMap) as T;
}
