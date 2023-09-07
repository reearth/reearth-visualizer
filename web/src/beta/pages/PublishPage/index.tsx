import React from "react";

import Published from "@reearth/beta/features/Published";
import CorePublished from "@reearth/beta/features/Published/core";
import { useCore } from "@reearth/beta/utils/use-core";

const PublishPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  const core = useCore("published", alias);

  console.log("called");
  return (
    <>
      {typeof core === "boolean" &&
        (core ? <CorePublished alias={alias} /> : <Published alias={alias} />)}
    </>
  );
};

export default PublishPage;
