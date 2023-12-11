import React from "react";
import { useParams } from "react-router-dom";

import Project from "@reearth/classic/components/organisms/Settings/Project";
import { AuthenticatedPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const ProjectPage: React.FC<Props> = () => {
  const { projectId = "" } = useParams();
  return (
    <AuthenticatedPage>
      <Project projectId={projectId} />
    </AuthenticatedPage>
  );
};

export default ProjectPage;
