import { useRef } from "react";

export const useRefValue = <V>(v: V) => {
  const vRef = useRef(v);
  vRef.current = v;
  return vRef;
};
