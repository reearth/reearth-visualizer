import React from "react";

import Published from "@reearth/components/organisms/Published";
import CorePublished from "@reearth/components/organisms/Published/core";
import { useCore } from "@reearth/util/use-core";
import { Provider as DndProvider } from "@reearth/util/use-dnd";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  const core = useCore("published", alias);

  return (
    <DndProvider>
      {typeof core === "boolean" &&
        (core ? <CorePublished alias={alias} /> : <Published alias={alias} />)}
    </DndProvider>
  );
};

export default PublishedPage;
