import PageWrapper from "@reearth/beta/features/RootPage/PageWrapper";
import { Loading } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import useHooks from "./hooks";

const RootPage: FC = () => {
  const { isLoading, isAuthenticated, error } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <PageWrapper loading={!error} />
  ) : null;
};

export default RootPage;
