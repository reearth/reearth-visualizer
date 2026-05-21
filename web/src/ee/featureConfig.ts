import { config } from "@reearth/services/config";
import { AppFeatureConfig } from "@reearth/services/config/appFeatureConfig";
import { DEPRECATED_TILE_TYPES } from "@reearth/services/config/constants";

import { EE_DEFAULT_TILE_TYPE } from "./constants";

export const getFeatureConfig = (): AppFeatureConfig => {
  const c = config();

  return {
    membersManagementOnDashboard: false,
    workspaceCreation: false,
    workspaceManagement: false,
    externalWorkspaceManagementUrl: `${c?.platformUrl}/[WORKSPACE_ALIAS]/settings`,
    accountManagement: false,
    projectVisibility: true,
    externalAccountManagementUrl: `${c?.platformUrl}/settings/profile`,
    builtinTimelineWidget: true,
    useProjectSplitImport: false,
    disabledTileTypes: [...DEPRECATED_TILE_TYPES],
    defaultTileType: EE_DEFAULT_TILE_TYPE
  };
};
