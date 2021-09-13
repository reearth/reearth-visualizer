import React from "react";
import { useIntl } from "react-intl";

import Loading from "@reearth/components/atoms/Loading";
import NotificationBar from "@reearth/components/atoms/NotificationBar";
import MoleculeTopPage from "@reearth/components/molecules/TopPage";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const TopPage: React.FC<Props> = () => {
  const intl = useIntl();
  const { isLoading, isAuthenticated, login, error } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <MoleculeTopPage login={login}>
      {error && (
        <NotificationBar type="error">
          {intl.formatMessage({ defaultMessage: "Sign in error" })}: {error}
        </NotificationBar>
      )}
    </MoleculeTopPage>
  ) : null;
};

export default TopPage;
