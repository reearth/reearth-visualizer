import React from "react";
import { useParams } from "react-router-dom";

import { withAuthenticationRequired } from "@reearth/auth";
import Plugin from "@reearth/components/organisms/Settings/Project/Plugin";

export type Props = {
  path?: string;
};

const PluginPage: React.FC<Props> = () => {
  const { projectId = "" } = useParams();
  return <Plugin projectId={projectId} />;
};

export default withAuthenticationRequired(PluginPage);
