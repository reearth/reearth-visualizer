import { mergeProperty } from ".";

test("mergeProperty", () => {
  const a = { a: { b: { lat: 0, lng: 1 } }, c: [{ d: 1 }, { d: 2 }], d: 1 };
  const b = { a: { b: { lat: 1 } }, c: [{ d: 3 }] };
  const e = { a: { b: { lat: 1 } }, c: [{ d: 3 }], d: 1 };

  const result = mergeProperty(a, b);
  expect(result).toEqual(e);
  expect(result).not.toBe(a);
});
