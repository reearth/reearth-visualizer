import React from "react";
import { useParams } from "react-router-dom";

import { withAuthenticationRequired } from "@reearth/auth";
import OrganismsProjectList from "@reearth/components/organisms/Settings/ProjectList";

export interface Props {
  path?: string;
}

const ProjectList: React.FC<Props> = () => {
  const { workspaceId = "" } = useParams();
  return <OrganismsProjectList workspaceId={workspaceId} />;
};

export default withAuthenticationRequired(ProjectList);
