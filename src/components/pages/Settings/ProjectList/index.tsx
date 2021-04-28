import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";

// Components
import OrganismsProjectList from "@reearth/components/organisms/Settings/ProjectList";

export interface Props {
  path?: string;
  teamId?: string;
}

const ProjectList: React.FC<Props> = ({ teamId = "" }) => <OrganismsProjectList teamId={teamId} />;

export default withAuthenticationRequired(ProjectList);
