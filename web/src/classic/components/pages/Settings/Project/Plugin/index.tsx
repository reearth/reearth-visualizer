import React from "react";
import { useParams } from "react-router-dom";

import Plugin from "@reearth/classic/components/organisms/Settings/Project/Plugin";
import { withAuthorisation } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const PluginPage: React.FC<Props> = () => {
  const { projectId = "" } = useParams();
  return <Plugin projectId={projectId} />;
};

export default withAuthorisation()(PluginPage);
