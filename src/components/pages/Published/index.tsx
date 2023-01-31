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
  const core = useCore();
  return (
    <DndProvider>
      {core ? <CorePublished alias={alias} /> : <Published alias={alias} />}
    </DndProvider>
  );
};

export default PublishedPage;
