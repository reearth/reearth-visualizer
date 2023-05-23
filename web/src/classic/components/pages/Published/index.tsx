import React from "react";

import Published from "@reearth/classic/components/organisms/Published";
import CorePublished from "@reearth/classic/components/organisms/Published/core";
import { useCore } from "@reearth/classic/util/use-core";
import { Provider as DndProvider } from "@reearth/classic/util/use-dnd";

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
