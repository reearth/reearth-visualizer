import { renderHook } from "@testing-library/react";
import { expect, test } from "vitest";

import { useGet, wrapRef } from "./utils";

test("useGet", () => {
  const obj = { a: 1 };
  const { result } = renderHook(() => useGet(obj));
  expect(result.current()).toBe(obj);
  expect(result.current().a).toBe(1);

  obj.a = 2;
  expect(result.current()).toBe(obj);
  expect(result.current().a).toBe(2);

  const { result: result2, rerender: rerender2 } = renderHook(
    props => {
      return useGet(props);
    },
    {
      initialProps: { b: 1 },
    },
  );
  expect(result2.current()).toEqual({ b: 1 });
  rerender2({ b: 2 });
  expect(result2.current()).toEqual({ b: 2 });
});

test("wrapRef", () => {
  const ref: {
    current: {
      a: (a: number, b: number) => number;
      b: string;
      c: (a: number, b: number) => number;
    } | null;
  } = {
    current: null,
  };

  const res = wrapRef(ref, { a: 1, c: 1 });
  expect(res).toEqual({
    a: expect.any(Function),
    b: undefined,
    c: expect.any(Function),
  });
  expect(res.a(1, 2)).toBeUndefined();
  expect((res as any).b).toBeUndefined();

  ref.current = {
    a: (a: number, b: number) => a + b,
    b: "foobar",
    c: (a: number, b: number) => a - b,
  };
  expect(res.a(1, 2)).toBe(3);
  expect((res as any).b).toBeUndefined();
  expect(res.c(1, 2)).toBe(-1);

  ref.current = null;
  expect(res.a(1, 2)).toBeUndefined();
  expect((res as any).b).toBeUndefined();
  expect(res.c(1, 2)).toBeUndefined();
});
