export default function deepGet<T>(
  array: T[] | undefined,
  index: number[],
  children?: (value: T, index: number, array: T[]) => T[] | undefined,
): T | undefined {
  if (!array?.length) return undefined;

  const find = (a: T[], i: number[]): T | undefined => {
    const e = a[i[0]];
    if (i.length > 1 && children) {
      const c = children(e, i[0], a);
      if (!c) return undefined;
      return find(c, i.slice(1));
    }
    return e;
  };

  return find(array, index);
}
