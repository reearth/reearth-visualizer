import { useContext } from "react";

import RestfulContext from "./context";

export default function useRestful() {
  const context = useContext(RestfulContext);
  if (!context) {
    throw new Error("useRestful must be used within a RestfulProvider");
  }
  return context;
}
