import { renderHook, act } from "@testing-library/react";
import { expect, test } from "vitest";

import useManageSwitchState, { Props } from "./hooks";

type SwitchField = {
  id: string;
  name: string;
  active: boolean;
};

const props: Props<SwitchField> = {
  fields: [
    { id: "1", name: "First component", active: true },
    { id: "2", name: "Second component", active: false },
    { id: "3", name: "Third component", active: false },
  ],
};

test("1. confirmation of initial state", () => {
  const { result } = renderHook(() => useManageSwitchState(props));
  expect(result.current.fields[0].id).toBe("1");
  expect(result.current.fields[1].id).toBe("2");
  expect(result.current.fields[2].id).toBe("3");
  expect(result.current.fields[0].name).toBe("First component");
  expect(result.current.fields[1].name).toBe("Second component");
  expect(result.current.fields[2].name).toBe("Third component");
  expect(result.current.fields[0].active).toBe(true);
  expect(result.current.fields[1].active).toBe(false);
  expect(result.current.fields[2].active).toBe(false);
});

test("2. only the second should be active", () => {
  const { result } = renderHook(() => useManageSwitchState(props));
  act(() => {
    result.current.handleActivate("2");
  });
  expect(result.current.fields[0].active).toBe(false);
  expect(result.current.fields[1].active).toBe(true);
  expect(result.current.fields[2].active).toBe(false);
});

test("3. only the third should be active", () => {
  const { result } = renderHook(() => useManageSwitchState(props));
  act(() => {
    result.current.handleActivate("3");
  });
  expect(result.current.fields[0].active).toBe(false);
  expect(result.current.fields[1].active).toBe(false);
  expect(result.current.fields[2].active).toBe(true);
});

test("4. status should remain the same", () => {
  const { result } = renderHook(() => useManageSwitchState(props));
  act(() => {
    result.current.handleActivate("1");
  });
  expect(result.current.fields[0].active).toBe(true);
  expect(result.current.fields[1].active).toBe(false);
  expect(result.current.fields[2].active).toBe(false);
});
