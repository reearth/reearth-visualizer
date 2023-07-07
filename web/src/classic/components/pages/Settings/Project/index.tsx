import React from "react";
import { useParams } from "react-router-dom";

import Project from "@reearth/classic/components/organisms/Settings/Project";
import { AuthenticationRequiredPage, withAuthorisation } from "@reearth/services/auth";

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

export default withAuthorisation()(ProjectPage);
