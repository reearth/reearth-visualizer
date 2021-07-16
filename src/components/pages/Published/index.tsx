import React from "react";

import Published from "@reearth/components/organisms/Published";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  return <Published alias={alias} />;
};

export default PublishedPage;
