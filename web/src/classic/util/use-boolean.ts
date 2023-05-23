import { Dispatch, useCallback, useState } from "react";

export default function useBoolean(
  initialState?: boolean,
): [boolean, Dispatch<boolean>, () => void, () => void, () => void] {
  const [value, setValue] = useState(initialState ?? false);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, setValue, on, off, toggle];
}
