import { delayedObject, merge, objectFromGetter } from "./object";

test("delayedObject", () => {
  const obj = { a: [], b: { a: 1 }, c: "a" };
  const obj2 = delayedObject(obj, ["c"]);

  expect(obj2).toStrictEqual(obj);

  const a = Object.getOwnPropertyDescriptor(obj2, "a");
  const b = Object.getOwnPropertyDescriptor(obj2, "b");
  const c = Object.getOwnPropertyDescriptor(obj2, "c");

  expect(a?.get).toBeInstanceOf(Function);
  expect(b?.get).toBeInstanceOf(Function);
  expect(c?.value).toBe("a");

  expect(() => {
    (obj2 as any).a = [];
  }).toThrowError("Cannot set property");
  expect(() => {
    (obj2 as any).b = { a: 2 };
  }).toThrowError("Cannot set property");
  expect(() => {
    (obj2 as any).c = "b";
  }).toThrowError("Cannot assign to read only property");
  expect(obj2).toStrictEqual(obj);
});

test("objectFromGetter", () => {
  const fn = jest.fn((k: "a" | "b"): "a!" | "b!" => (k === "a" ? "a!" : "b!"));
  const obj = objectFromGetter<{ a: "a!"; b: "b!" }>(["a", "b"], fn);

  expect(obj.a).toBe("a!");
  expect(fn).toBeCalledWith("a");
  expect(fn).toBeCalledTimes(1);
  expect(obj.b).toBe("b!");
  expect(fn).toBeCalledWith("b");
  expect(fn).toBeCalledTimes(2);
  expect(obj).toEqual({ a: "a!", b: "b!" });
  expect(Object.keys(obj)).toEqual(["a", "b"]);

  const a = Object.getOwnPropertyDescriptor(obj, "a");
  const b = Object.getOwnPropertyDescriptor(obj, "b");
  expect(a?.get).toBeInstanceOf(Function);
  expect(b?.get).toBeInstanceOf(Function);

  expect(() => {
    (obj as any).a = "";
  }).toThrowError("Cannot set property");
  expect(() => {
    (obj as any).b = "";
  }).toThrowError("Cannot set property");
});

test("merge", () => {
  const o = merge(
    {
      get a() {
        return 1;
      },
      b: 2,
    },
    {
      get c() {
        return 3;
      },
    },
  );
  expect(o).toEqual({ a: 1, b: 2, c: 3 });
  expect(Object.getOwnPropertyDescriptor(o, "a")?.get).toBeInstanceOf(Function);
  expect(Object.getOwnPropertyDescriptor(o, "b")?.get).toBeUndefined();
  expect(Object.getOwnPropertyDescriptor(o, "c")?.get).toBeInstanceOf(Function);

  expect(() => {
    (o as any).a = "";
  }).toThrowError("Cannot set property");
  expect(() => {
    (o as any).c = "";
  }).toThrowError("Cannot set property");
});
