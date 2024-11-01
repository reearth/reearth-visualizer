import React from "react";

import RootPageFeature from "@reearth/beta/features/RootPage";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  return <RootPageFeature />;
};

export default RootPage;
