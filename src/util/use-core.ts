import { useMemo } from "react";

// TODO: Remove this hook when we use reearth/core completely.
export const useCore = () => {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  return query.has("useCore");
};
