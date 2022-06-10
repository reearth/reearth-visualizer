import React from "react";

import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetContainer from "@reearth/components/organisms/Common/AssetContainer";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

import useHooks from "./hooks";

type Props = {
  teamId: string;
};

const Asset: React.FC<Props> = ({ teamId }: Props) => {
  const t = useT();
  const { currentProject, currentTeam } = useHooks({ teamId });

  return (
    <SettingPage teamId={teamId} projectId={currentProject?.id}>
      <SettingsHeader title={t("Assets")} currentWorkspace={currentTeam} />
      <AssetContainer teamId={teamId} isMultipleSelectable height={700} allowDeletion />
    </SettingPage>
  );
};

export default Asset;
