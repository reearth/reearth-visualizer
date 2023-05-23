import React from "react";

import OrganismRootPage from "@reearth/classic/components/organisms/Authentication/RootPage";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  return <OrganismRootPage />;
};

export default RootPage;
