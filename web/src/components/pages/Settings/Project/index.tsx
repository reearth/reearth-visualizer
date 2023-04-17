import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Project from "@reearth/components/organisms/Settings/Project";

export type Props = {
  path?: string;
};

const ProjectPage: React.FC<Props> = () => {
  const { projectId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Project projectId={projectId} />
    </AuthenticationRequiredPage>
  );
};

export default ProjectPage;
