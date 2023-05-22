import React from "react";
import { useParams } from "react-router-dom";

import OrganismsProjectList from "@reearth/classic/components/organisms/Settings/ProjectList";
import { withAuthenticationRequired } from "@reearth/services/auth";

export interface Props {
  path?: string;
}

const ProjectList: React.FC<Props> = () => {
  const { workspaceId = "" } = useParams();
  return <OrganismsProjectList workspaceId={workspaceId} />;
};

export default withAuthenticationRequired(ProjectList);
