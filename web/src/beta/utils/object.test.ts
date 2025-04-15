import { describe, it, expect } from "vitest";

import { clone, merge } from "./object";

describe("clone function", () => {
  it("should create a shallow copy of an object", () => {
    const original = { a: 1, b: 2 };
    const cloned = clone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  it("should copy property descriptors correctly", () => {
    const original = {};
    Object.defineProperty(original, "readOnlyProp", {
      value: "test",
      writable: false,
      enumerable: true
    });

    const cloned = clone(original);

    const descriptor = Object.getOwnPropertyDescriptor(cloned, "readOnlyProp");
    expect(descriptor?.writable).toBe(false);
    expect(descriptor?.value).toBe("test");
  });

  it("should handle objects with nested properties", () => {
    const nested = { inner: { value: 42 } };
    const cloned = clone(nested);

    expect(cloned.inner).toBe(nested.inner); // Same reference (shallow copy)
    cloned.inner.value = 100;
    expect(nested.inner.value).toBe(100); // Original is affected (shallow copy)
  });
});

describe("merge function", () => {
  it("should merge properties from multiple objects", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3 };
    const obj3 = { d: 4, e: 5 };

    const result = merge(obj1, obj2, obj3);

    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 });
  });

  it("should override properties from left to right", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };

    const result = merge(obj1, obj2);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it("should preserve property descriptors", () => {
    const obj1 = {};
    Object.defineProperty(obj1, "prop1", {
      value: "test1",
      writable: false,
      enumerable: true
    });

    const obj2 = {};
    Object.defineProperty(obj2, "prop2", {
      value: "test2",
      writable: false,
      enumerable: true
    });

    const result = merge(obj1, obj2);

    const descriptor1 = Object.getOwnPropertyDescriptor(result, "prop1");
    const descriptor2 = Object.getOwnPropertyDescriptor(result, "prop2");

    expect(descriptor1?.writable).toBe(false);
    expect(descriptor1?.value).toBe("test1");
    expect(descriptor2?.writable).toBe(false);
    expect(descriptor2?.value).toBe("test2");
  });

  it("should not modify original objects", () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };

    const result = merge(obj1, obj2);
    result.a = 3;
    result.b = 4;

    expect(obj1.a).toBe(1);
    expect(obj2.b).toBe(2);
  });

  it("should handle nested objects (shallow merge)", () => {
    const obj1 = { a: { value: 1 } };
    const obj2 = { b: { value: 2 } };

    const result = merge(obj1, obj2);

    // References to nested objects are preserved (shallow merge)
    expect(result.a).toBe(obj1.a);
    expect(result.b).toBe(obj2.b);

    // Modifying nested object in result affects original
    result.a.value = 3;
    expect(obj1.a.value).toBe(3);
  });
});
