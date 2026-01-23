import RootPageFeature from "@reearth/app/features/RootPage";
import React from "react";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  return <RootPageFeature />;
};

export default RootPage;
