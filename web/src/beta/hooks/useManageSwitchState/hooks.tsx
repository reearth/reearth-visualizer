import { useState, useCallback } from "react";

type SwitchField<T> = {
  id: string;
  active?: boolean;
} & T;

export type Props<T> = {
  fields: SwitchField<T>[];
};

export const useManageSwitchState = <T,>({ fields }: Props<T>) => {
  const [fieldsState, setFieldsState] = useState(fields);
  const handleActivate = useCallback((id: string) => {
    setFieldsState(f =>
      f.map(v => ({
        ...v,
        active: v.id === id,
      })),
    );
  }, []);
  return { handleActivate, fields: fieldsState };
};

export default useManageSwitchState;
