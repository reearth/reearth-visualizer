import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import MoleculeRootPage from "@reearth/components/molecules/RootPage";

import useHooks from "./hooks";

const RootPage: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useHooks();

  return isLoading ? <Loading /> : !isAuthenticated ? <MoleculeRootPage loading={!error} /> : null;
};

export default RootPage;
