import React from "react";

import Published from "@reearth/components/organisms/Published";
import { Provider as DndProvider } from "@reearth/util/use-dnd";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  return (
    <DndProvider>
      <Published alias={alias} />
    </DndProvider>
  );
};

export default PublishedPage;
