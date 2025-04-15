/**
 * Creates a shallow clone of an object by copying all property descriptors
 */
export function clone<T extends object>(obj: T): T {
  const obj2 = {} as Record<string, unknown>;
  Object.defineProperties(obj2, Object.getOwnPropertyDescriptors(obj));
  return obj2 as T;
}

// Type definitions for merge function
type BoxedTupleTypes<T extends unknown[]> = { [P in keyof T]: [T[P]] }[Exclude<
  keyof T,
  keyof unknown[]
>];

type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type UnboxIntersection<T> = T extends { 0: infer U } ? U : never;

/**
 * Merges multiple objects into a single object
 */
export function merge<O extends object, P extends object[]>(
  o1: O,
  ...o2: P
): O & UnboxIntersection<UnionToIntersection<BoxedTupleTypes<P>>> {
  const obj = clone(o1);
  for (const o of o2) {
    Object.defineProperties(obj, Object.getOwnPropertyDescriptors(o));
  }
  return obj as O & UnboxIntersection<UnionToIntersection<BoxedTupleTypes<P>>>;
}
