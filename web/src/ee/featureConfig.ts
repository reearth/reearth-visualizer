import { config } from "@reearth/services/config";
import { AppFeatureConfig } from "@reearth/services/config/appFeatureConfig";

export const getFeatureConfig = (): AppFeatureConfig => {
  const c = config();

  return {
    membersManagementOnDashboard: false,
    workspaceCreation: false,
    workspaceManagement: false,
    accountManagement: false,
    projectCreation: false,
    projectVisibility: false,
    externalAccountManagementUrl: `${c?.platformUrl}/settings/profile`
  };
};
