import { Args, Args3, Args2 } from "@reearth/types";
import { useRef } from "react";

/**
 * Often we want to make an array of keys of an object type,
 * but if we just specify the key names directly, we may forget to change the array if the object type is changed.
 * With this function, the compiler checks the object keys for completeness, so the array of keys is always up to date.
 */
export const objKeys = <T>(obj: { [k in keyof T]: 0 }): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};

export const isPresent = <V>(v: V | undefined): v is V =>
  typeof v !== "undefined";

export const partitionObject = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): [Pick<T, K>, Omit<T, K>] => {
  const a: any = {};
  const b: any = {};
  for (const k of Object.keys(obj)) {
    if (keys.includes(k as K)) {
      a[k] = obj[k as K];
    } else {
      b[k] = obj[k as K];
    }
  }
  return [a, b];
};

export const bindFunc = <F extends (a: A, ...args: any[]) => any, A>(
  f?: F,
  a?: A,
) =>
  isPresent(f) && isPresent(a)
    ? (...args: Args<F>) => f(a, ...args)
    : undefined;

export const bindFunc2 = <F extends (a: A, b: B, ...args: any[]) => any, A, B>(
  f?: F,
  a?: A,
  b?: B,
) =>
  isPresent(f) && isPresent(a) && isPresent(b)
    ? (...args: Args2<F>) => f(a, b, ...args)
    : undefined;

export const bindFunc3 = <
  F extends (a: A, b: B, c: C, ...args: any[]) => any,
  A,
  B,
  C,
>(
  f?: F,
  a?: A,
  b?: B,
  c?: C,
) =>
  isPresent(f) && isPresent(a) && isPresent(b) && isPresent(c)
    ? (...args: Args3<F>) => f(a, b, c, ...args)
    : undefined;

// TODO: remove this
export function checkIfFileType(url: string, fileTypes: string) {
  const formats = fileTypes.split(/,.|\./).splice(1);
  let regexString = "\\.(";

  for (let i = 0; i < formats.length; i++) {
    if (i === formats.length - 1) {
      regexString += formats[i];
    } else {
      regexString += formats[i] + "|";
    }
  }
  regexString += ")$";

  const regex = new RegExp(regexString);

  return regex.test(url);
}

export const isEmptyString = function (text: string): boolean {
  return text === null || /^ *$/.test(text);
};

export function useConstant<T>(callback: () => T): T {
  const ref = useRef<{ value: T }>();
  if (ref.current == null) {
    ref.current = { value: callback() };
  }
  return ref.current.value;
}
