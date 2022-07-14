import { renderHook, act } from "@testing-library/react";

import { mergeProperty, useOverriddenProperty, useGet } from "./utils";

test("mergeProperty", () => {
  const a = { a: { b: { lat: 0, lng: 1 } }, c: [{ d: 1 }, { d: 2 }], d: 1 };
  const b = { a: { b: { lat: 1 } }, c: [{ d: 3 }] };
  const e = { a: { b: { lat: 1 } }, c: [{ d: 3 }], d: 1 };

  const result = mergeProperty(a, b);
  expect(result).toEqual(e);
  expect(result).not.toBe(a);
  expect(result.a).not.toBe(a.a);
  expect(result.c).not.toBe(a.c);
  expect(result.c[0]).not.toBe(a.c[0]);
});

test("useOverriddenProperty", () => {
  const a = { a: { b: { lat: 0, lng: 1 } }, b: 1 };

  const { result } = renderHook(() => useOverriddenProperty<any>(a));
  let [overridenProperty, overrideProperty] = result.current;
  expect(overridenProperty).toEqual({ a: { b: { lat: 0, lng: 1 } }, b: 1 });

  // override: override order is now ["aaa"]
  act(() => {
    overrideProperty("aaa", { a: { b: { lat: 1, lng: 0 } } });
  });

  [overridenProperty, overrideProperty] = result.current;
  expect(overridenProperty).toEqual({ a: { b: { lat: 1, lng: 0 } }, b: 1 });

  // override without pluginId: ["", "aaa"]
  act(() => {
    overrideProperty("", { a: { b: { lat: 0.1, lng: 0 } } });
  });

  [overridenProperty, overrideProperty] = result.current;
  expect(overridenProperty).toEqual({ a: { b: { lat: 1, lng: 0 } }, b: 1 });

  // cancel override: [""]
  act(() => {
    overrideProperty("aaa", undefined);
  });

  [overridenProperty, overrideProperty] = result.current;
  expect(overridenProperty).toEqual({ a: { b: { lat: 0.1, lng: 0 } }, b: 1 });
});

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
