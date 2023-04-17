import React from "react";

import PluginEditorOrganism from "@reearth/components/organisms/PluginEditor";

export type Props = {
  path?: string;
};

const PluginEditor: React.FC<Props> = () => <PluginEditorOrganism />;

export default PluginEditor;
