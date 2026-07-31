import { describe, expect, test, vi } from "vitest";

import { copyWithOverrides } from "./copyWithOverrides";

describe("copyWithOverrides", () => {
  test("copies plain data properties", () => {
    const source = { a: 1, b: "hello", c: true };
    const result = copyWithOverrides(source, {});

    expect(result).toEqual(source);
    expect(result).not.toBe(source);
    expect(result.a).toBe(1);
    expect(result.b).toBe("hello");
    expect(result.c).toBe(true);
  });

  test("overrides specified keys", () => {
    const source = { a: 1, b: 2, c: 3 };
    const result = copyWithOverrides(source, { b: 99 });

    expect(result.a).toBe(1);
    expect(result.b).toBe(99);
    expect(result.c).toBe(3);
  });

  test("preserves getters that return dynamic values", () => {
    let counter = 0;
    const source = {
      get value() {
        return ++counter;
      }
    };
    const result = copyWithOverrides(source, {});

    expect(result.value).toBe(1);
    expect(result.value).toBe(2);
    expect(result.value).toBe(3);
  });

  test("preserves getters that return the latest reference", () => {
    let data = [1, 2, 3];
    const source = {
      get items() {
        return [...data];
      }
    };
    const result = copyWithOverrides(source, {});

    expect(result.items).toEqual([1, 2, 3]);

    data.push(4);
    expect(result.items).toEqual([1, 2, 3, 4]);

    data = [];
    expect(result.items).toEqual([]);
  });

  test("getters on result are own property descriptors, not prototype-based", () => {
    const source = { get x() { return 42; } };
    const result = copyWithOverrides(source, {});

    const ownDesc = Object.getOwnPropertyDescriptor(result, "x");
    expect(ownDesc).toBeDefined();
    expect(ownDesc?.get).toBeDefined();
    expect(ownDesc?.value).toBeUndefined();
  });

  test("overridden keys become plain data properties, not getters", () => {
    let counter = 0;
    const source = {
      get tracked() {
        return ++counter;
      }
    };
    const trackedFn = vi.fn(() => "overridden");
    const result = copyWithOverrides(source, { tracked: trackedFn });

    const ownDesc = Object.getOwnPropertyDescriptor(result, "tracked");
    expect(ownDesc?.get).toBeUndefined();
    expect(ownDesc?.value).toBe(trackedFn);

    expect(result.tracked).toBe(trackedFn);
  });

  test("non-overridden getter and overridden data property coexist", () => {
    let counter = 0;
    const source = {
      get dynamic() {
        return ++counter;
      },
      static: "unchanged"
    };
    const result = copyWithOverrides(source, { static: "changed" });

    expect(result.dynamic).toBe(1);
    expect(result.dynamic).toBe(2);
    expect(result.static).toBe("changed");
  });

  test("works with method properties", () => {
    const fn = () => "hello";
    const source = { greet: fn };
    const result = copyWithOverrides(source, {});

    expect(result.greet).toBe(fn);
    expect(result.greet()).toBe("hello");
  });

  test("works with empty source", () => {
    const result = copyWithOverrides({}, {});
    expect(Object.keys(result)).toEqual([]);
  });

  test("key ordering: overrides are own properties, existing keys are preserved", () => {
    const source = { a: 1, b: 2, c: 3 };
    const result = copyWithOverrides(source, { b: 99, d: 4 });

    expect(Object.keys(result).sort()).toEqual(["a", "b", "c", "d"]);
    expect((result as Record<string, unknown>).d).toBe(4);
  });

  test("demonstrates the spread bug: spread evaluates getters once", () => {
    // This test validates the bug that copyWithOverrides fixes
    let counter = 0;
    const source = {
      get value() {
        return ++counter;
      }
    };

    // With spread: getter evaluated once
    const spreadResult = { ...source };
    expect(spreadResult.value).toBe(1);
    expect(spreadResult.value).toBe(1); // stuck at 1 — getter already evaluated

    // With copyWithOverrides: getter preserved
    counter = 0;
    const fixedResult = copyWithOverrides(source, {});
    expect(fixedResult.value).toBe(1);
    expect(fixedResult.value).toBe(2);
    expect(fixedResult.value).toBe(3);
  });

  test("demonstrates array snapshot with spread vs dynamic with copyWithOverrides", () => {
    let data: number[] = [1, 2, 3];
    const source = {
      get items() {
        return [...data];
      }
    };

    const spreadResult = { ...source };
    expect(spreadResult.items).toEqual([1, 2, 3]);
    data.push(4);
    expect(spreadResult.items).toEqual([1, 2, 3]); // stale snapshot

    data = [1, 2, 3];
    const fixedResult = copyWithOverrides(source, {});
    expect(fixedResult.items).toEqual([1, 2, 3]);
    data.push(4);
    expect(fixedResult.items).toEqual([1, 2, 3, 4]); // reflects latest
  });
});
