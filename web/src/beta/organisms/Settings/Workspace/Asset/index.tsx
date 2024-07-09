import React from "react";

import SettingsHeader from "@reearth/beta/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/beta/organisms/Settings/SettingPage";
import AssetContainer from "@reearth/classic/components/organisms/Common/AssetContainer";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";

type Props = {
  workspaceId: string;
};

const Asset: React.FC<Props> = ({ workspaceId }: Props) => {
  const t = useT();
  const { currentProject, currentWorkspace } = useHooks({ workspaceId });

  return (
    <SettingPage workspaceId={workspaceId} projectId={currentProject?.id}>
      <SettingsHeader title={t("Assets")} currentWorkspace={currentWorkspace} />
      <AssetContainer workspaceId={workspaceId} isMultipleSelectable height={700} allowDeletion />
    </SettingPage>
  );
};

export default Asset;
