import React from "react";

import { withAuthenticationRequired } from "@reearth/auth";
import Plugin from "@reearth/components/organisms/Settings/Project/Plugin";

export type Props = {
  path?: string;
  projectId?: string;
};

const PluginPage: React.FC<Props> = ({ projectId = "" }) => <Plugin projectId={projectId} />;

export default withAuthenticationRequired(PluginPage);
