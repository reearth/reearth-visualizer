import React from "react";
import { useIntl } from "react-intl";

import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetContainer from "@reearth/components/organisms/Common/AssetContainer";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  teamId: string;
};

const Asset: React.FC<Props> = ({ teamId }: Props) => {
  const intl = useIntl();
  const { currentProject, currentTeam } = useHooks({ teamId });

  return (
    <SettingPage teamId={teamId} projectId={currentProject?.id}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Assets" })}
        currentWorkspace={currentTeam}
      />
      <AssetContainer teamId={teamId} isMultipleSelectable height={700} allowDeletion />
    </SettingPage>
  );
};

export default Asset;
