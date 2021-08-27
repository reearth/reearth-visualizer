import React from "react";

import { withAuthenticationRequired } from "@reearth/auth";
import OrganismsProjectList from "@reearth/components/organisms/Settings/ProjectList";

export interface Props {
  path?: string;
  teamId?: string;
}

const ProjectList: React.FC<Props> = ({ teamId = "" }) => <OrganismsProjectList teamId={teamId} />;

export default withAuthenticationRequired(ProjectList);
