import { useRef } from "react";

const useBuffered = <T>(state: T, dep: boolean): T => {
  const bufferedState = useRef(state);
  if (dep) {
    bufferedState.current = state;
  }
  return bufferedState.current;
};

export default useBuffered;
