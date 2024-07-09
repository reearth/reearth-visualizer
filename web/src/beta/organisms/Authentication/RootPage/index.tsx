import React from "react";

import Loading from "@reearth/beta/components/Loading";
import MoleculeRootPage from "@reearth/beta/molecules/RootPage";

import useHooks from "./hooks";

const RootPage: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useHooks();

  return isLoading ? <Loading /> : !isAuthenticated ? <MoleculeRootPage loading={!error} /> : null;
};

export default RootPage;
