import { renderHook } from "@testing-library/react";
import { expect, test } from "vitest";

import { useGet } from "./utils";

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
