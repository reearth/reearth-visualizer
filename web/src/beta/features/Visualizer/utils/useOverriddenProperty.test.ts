import { act, renderHook } from "@testing-library/react";
import { expect, test } from "vitest";

import { useOverriddenProperty } from "./useOverriddenProperty";

test("overriddenProperty", () => {
  const { result } = renderHook(() => useOverriddenProperty({ a: 1, b: 2, c: { c1: 3 } }));
  const [mergedProperty, overrideProperty] = result.current;
  expect(mergedProperty).toEqual({ a: 1, b: 2, c: { c1: 3 } });

  act(() => {
    overrideProperty("plugin1", { a: 2 } as any);
  });
  expect(result.current[0]).toEqual({ a: 2, b: 2, c: { c1: 3 } });

  act(() => {
    overrideProperty("plugin2", { b: 3 } as any);
  });
  expect(result.current[0]).toEqual({ a: 2, b: 3, c: { c1: 3 } });

  act(() => {
    overrideProperty("plugin3", { c: { c2: 1 } } as any);
  });
  expect(result.current[0]).toEqual({ a: 2, b: 3, c: { c1: 3, c2: 1 } });

  act(() => {
    overrideProperty("plugin1", undefined as any);
  });
  expect(result.current[0]).toEqual({ a: 1, b: 3, c: { c1: 3, c2: 1 } });

  act(() => {
    overrideProperty("plugin2", undefined as any);
  });
  expect(result.current[0]).toEqual({ a: 1, b: 2, c: { c1: 3, c2: 1 } });
});
