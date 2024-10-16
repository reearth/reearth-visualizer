import { Loading } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import useHooks from "./hooks";
import PageWrapper from "./PageWrapper";

const RootPage: FC = () => {
  const { isLoading, isAuthenticated, error } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <PageWrapper loading={!error} />
  ) : null;
};

export default RootPage;
