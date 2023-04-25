import React from "react";

import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetContainer from "@reearth/components/organisms/Common/AssetContainer";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

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
