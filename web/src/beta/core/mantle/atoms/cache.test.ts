import { renderHook, act } from "@testing-library/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { test, expect } from "vitest";

import { cacheAtom, doubleKeyCacheAtom } from "./cache";

test("cacheAtom", () => {
  const { result } = renderHook(() => {
    const atoms = useMemo(() => cacheAtom<string, string>(), []);
    const get = useAtomValue(atoms.get);
    const set = useSetAtom(atoms.set);
    return { get, set };
  });

  expect(result.current.get("test")).toBeUndefined();

  act(() => {
    result.current.set({ key: "test", value: "aaaa" });
  });

  expect(result.current.get("test")).toBe("aaaa");

  act(() => {
    result.current.set({ key: "test" });
  });

  expect(result.current.get("test")).toBeUndefined();
});

test("doubleKeyCacheAtom", () => {
  const { result } = renderHook(() => {
    const atoms = useMemo(() => doubleKeyCacheAtom<string, string, string>(), []);
    const get = useAtomValue(atoms.get);
    const getAll = useAtomValue(atoms.getAll);
    const set = useSetAtom(atoms.set);
    return { get, set, getAll };
  });

  expect(result.current.get("test", "a")).toBeUndefined();
  expect(result.current.get("test", "b")).toBeUndefined();
  expect(result.current.get("test", "c")).toBeUndefined();

  act(() => {
    result.current.set({ key: "test", key2: "a", value: "aaaa" });
    result.current.set({ key: "test", key2: "c", value: "ccc" });
  });

  expect(result.current.get("test", "a")).toBe("aaaa");
  expect(result.current.get("test", "b")).toBeUndefined();
  expect(result.current.get("test", "c")).toBe("ccc");
  expect(result.current.getAll("test")).toEqual(["aaaa", "ccc"]);

  act(() => {
    result.current.set({ key: "test", key2: "a" });
  });

  expect(result.current.get("test", "a")).toBeUndefined();
  expect(result.current.get("test", "b")).toBeUndefined();
  expect(result.current.get("test", "c")).toBe("ccc");
});
