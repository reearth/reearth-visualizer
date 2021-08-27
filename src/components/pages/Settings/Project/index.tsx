import React from "react";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Project from "@reearth/components/organisms/Settings/Project";

export type Props = {
  path?: string;
  projectId?: string;
};

const ProjectPage: React.FC<Props> = ({ projectId = "" }) => (
  <AuthenticationRequiredPage>
    <Project projectId={projectId} />
  </AuthenticationRequiredPage>
);

export default ProjectPage;
