import RootPageFeature from "@reearth/beta/features/RootPage";
import React from "react";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  return <RootPageFeature />;
};

export default RootPage;
