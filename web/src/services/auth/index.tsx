import { ReactNode } from "react";

import GlobalModal from "@reearth/classic/components/organisms/GlobalModal";

import { useAuthenticationRequired } from "./useAuth";

export { AuthProvider } from "./authProvider";
export { useAuth, useCleanUrl, useAuthenticationRequired } from "./useAuth";

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
