import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import MoleculeTopPage from "@reearth/components/molecules/TopPage";
import NotificationBanner from "@reearth/components/organisms/Notification";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const TopPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, login } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <MoleculeTopPage login={login}>
      <NotificationBanner />
    </MoleculeTopPage>
  ) : null;
};

export default TopPage;
