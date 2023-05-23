import React from "react";

import PluginEditorOrganism from "@reearth/classic/components/organisms/PluginEditor";

export type Props = {
  path?: string;
};

const PluginEditor: React.FC<Props> = () => <PluginEditorOrganism />;

export default PluginEditor;
