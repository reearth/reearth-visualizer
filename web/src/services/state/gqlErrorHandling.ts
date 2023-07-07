import { atom, useAtom, useSetAtom } from "jotai";

// useError is needed for Apollo provider error only. Handle other errors with useNotification directly.
type GQLError = { type?: string; message?: string };
const error = atom<GQLError | undefined>(undefined);

export const useError = () => useAtom(error);

export default () => {
  const setError = useSetAtom(error);
  return { setError };
};
