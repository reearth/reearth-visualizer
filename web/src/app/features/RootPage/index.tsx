import { Loading } from "@reearth/app/lib/reearth-ui";
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
