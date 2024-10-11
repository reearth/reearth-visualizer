import { useProjectFetcher } from "@reearth/services/api";
import React, { FC } from "react";

const RecyleBin: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
    const { useDeletedProjectsQuery } = useProjectFetcher();
    
  const { deletedProjects } = useDeletedProjectsQuery(workspaceId);

    console.log("deletedProjects", deletedProjects);
  return <div>index</div>;
};

export default RecyleBin;
