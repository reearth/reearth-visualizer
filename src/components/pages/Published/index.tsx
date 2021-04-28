import React from "react";

import PublishedEarth from "@reearth/components/organisms/Published/PublishedEarth";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  return <PublishedEarth alias={alias} />;
};

export default PublishedPage;
