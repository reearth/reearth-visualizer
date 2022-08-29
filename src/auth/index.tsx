import { ReactNode } from "react";

import GlobalModal from "@reearth/components/organisms/GlobalModal";

import { useAuthenticationRequired } from "./hooks";

export { default as Provider } from "./provider";
export { default as useAuth, useCleanUrl, useAuthenticationRequired } from "./hooks";

export { withAuthenticationRequired } from "@auth0/auth0-react";

export const AuthenticationRequiredPage: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [isAuthenticated] = useAuthenticationRequired(); // TODO: show error
  return isAuthenticated && children ? (
    <>
      <GlobalModal />
      {children}
    </>
  ) : null;
};
