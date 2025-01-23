import { atom, useAtom, useSetAtom } from "jotai";

// useError is needed for Apollo provider error only. Handle other errors with useNotification directly.
export type GQLError = {
  type?: string;
  message?: string;
  code?: string;
  description?: string;
};
const errors = atom<GQLError[]>([]);
export const useErrors = () => useAtom(errors);

export default () => {
  const setErrors = useSetAtom(errors);
  return { setErrors };
};
