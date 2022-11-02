export function delayedObject<T extends {}>(obj: T, excludedKeys?: string[]): Readonly<T> {
  const res: any = {};
  const descs = Object.keys(obj).reduce<PropertyDescriptorMap>(
    (a, b) => ({
      ...a,
      [b]: excludedKeys?.includes(b)
        ? {
            value: (obj as any)[b],
            configurable: false,
            enumerable: true,
            writable: false,
          }
        : {
            get() {
              return (obj as any)[b];
            },
            configurable: false,
            enumerable: true,
          },
    }),
    {},
  );
  Object.defineProperties(res, descs);
  return res;
}

export function objectFromGetter<T extends { [K in keyof T]: any }>(
  keys: (keyof T)[],
  fn: (this: T, key: keyof T) => T[keyof T],
): Readonly<T> {
  const res: any = {};
  const descs = keys.reduce<PropertyDescriptorMap>(
    (a, b) => ({
      ...a,
      [b]: {
        get(this: any): any {
          return fn.call(this, b);
        },
        configurable: false,
        enumerable: true,
      },
    }),
    {},
  );
  Object.defineProperties(res, descs);
  return res;
}

export function clone<T>(obj: T): T {
  const obj2: any = {};
  Object.defineProperties(obj2, Object.getOwnPropertyDescriptors(obj));
  return obj2;
}

type BoxedTupleTypes<T extends any[]> = { [P in keyof T]: [T[P]] }[Exclude<keyof T, keyof any[]>];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
type UnboxIntersection<T> = T extends { 0: infer U } ? U : never;

export function merge<O, P extends any[]>(
  o1: O,
  ...o2: P
): O & UnboxIntersection<UnionToIntersection<BoxedTupleTypes<P>>> {
  const obj: any = clone(o1);
  for (const o of o2) {
    Object.defineProperties(obj, Object.getOwnPropertyDescriptors(o));
  }
  return obj;
}
