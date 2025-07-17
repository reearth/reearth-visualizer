import { Loading } from "@reearth/app/lib/reearth-ui";
import Welcome from "@reearth/ee/features/Welcome";
import { FC } from "react";

import useHooks from "./hooks";
import PageWrapper from "./PageWrapper";

const RootPage: FC = () => {
  const { isLoading, isAuthenticated, error, showExternalAuth0Signup } =
    useHooks();

  return isLoading ? (
    <Loading />
  ) : showExternalAuth0Signup ? (
    <Welcome />
  ) : !isAuthenticated ? (
    <PageWrapper loading={!error} />
  ) : null;
};

export default RootPage;
