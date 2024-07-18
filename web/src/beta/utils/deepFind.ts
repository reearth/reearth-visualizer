export default function deepFind<T>(
  array: T[] | undefined,
  cb: (value: T, index: number, array: T[]) => boolean,
  children?: (value: T, index: number, array: T[]) => T[] | undefined,
): [T | undefined, number[]] {
  if (!array?.length) return [undefined, []];

  const find = (a: T[]): [T | undefined, number[]] => {
    const i = a.findIndex(cb);
    if (i >= 0) return [a[i], [i]];
    if (!children) return [undefined, []];

    for (let i = 0; i < a.length; i++) {
      const c = children(a[i], i, a);
      if (!c?.length) continue;

      const res = find(c);
      if (typeof res[0] !== "undefined") {
        return [res[0], [i, ...res[1]]];
      }
    }

    return [undefined, []];
  };

  return find(array);
}
