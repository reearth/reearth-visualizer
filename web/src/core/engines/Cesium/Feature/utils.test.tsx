import { expect, test } from "vitest";

import { renderHook } from "@reearth/test/utils";

import { usePick } from "./utils";

test("usePick", () => {
  const f = ["a", "b"] as const;
  const p: { a?: number; b?: number; c?: number } = { a: 1, b: 2, c: 3 };
  const { result, rerender } = renderHook(({ p }) => usePick(p, f), { initialProps: { p: p } });

  expect(result.current).toEqual({ a: 1, b: 2 });
  const first = result.current;

  rerender({ p: { a: p.a, b: p.b, c: p.c } });
  expect(result.current).toBe(first);
  expect(result.current).toEqual({ a: 1, b: 2 });

  rerender({ p: { c: p.c, b: p.b, a: p.a } });
  expect(result.current).toBe(first);
  expect(result.current).toEqual({ a: 1, b: 2 });

  rerender({ p: { b: p.b, a: p.a } });
  expect(result.current).toBe(first);
  expect(result.current).toEqual({ a: 1, b: 2 });

  rerender({ p: { a: 10 } });
  expect(result.current).not.toBe(first);
  expect(result.current).toEqual({ a: 10 });
});
