import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";

// Components
import Plugin from "@reearth/components/organisms/Settings/Project/Plugin";

export interface Props {
  path?: string;
  projectId?: string;
}

const PluginPage: React.FC<Props> = ({ projectId = "" }) => <Plugin projectId={projectId} />;

export default withAuthenticationRequired(PluginPage);
