import React from "react";

import Loading from "@reearth/beta/components/Loading";
import PageWrapper from "@reearth/beta/features/RootPage/PageWrapper";

import useHooks from "./hooks";

const RootPage: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useHooks();

  return isLoading ? <Loading /> : !isAuthenticated ? <PageWrapper loading={!error} /> : null;
};

export default RootPage;
