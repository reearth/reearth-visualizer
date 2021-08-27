import React, { PropsWithChildren } from "react";
import { useAuthenticationRequired } from "./hooks";

export { default as Provider } from "./provider";
export { default as useAuth, useCleanUrl, useAuthenticationRequired } from "./hooks";

export { withAuthenticationRequired } from "@auth0/auth0-react";

export function AuthenticationRequiredPage({
  children,
}: PropsWithChildren<unknown>): JSX.Element | null {
  const [isAuthenticated] = useAuthenticationRequired(); // TODO: show error
  return isAuthenticated && children ? <>{children}</> : null;
}
