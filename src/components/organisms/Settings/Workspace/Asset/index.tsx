import React from "react";
import { useIntl } from "react-intl";
import useHooks from "./hooks";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import AssetSection from "@reearth/components/molecules/Settings/Workspace/Asset/AssetSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";

type Props = {
  teamId: string;
};

const Asset: React.FC<Props> = ({ teamId }: Props) => {
  const intl = useIntl();
  const { currentProject, currentTeam, assets, createAssets, removeAsset } = useHooks({ teamId });

  return (
    <SettingPage teamId={teamId} projectId={currentProject?.id}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Assets" })}
        currentWorkspace={currentTeam}
      />
      <AssetSection assets={assets} onCreate={createAssets} onRemove={removeAsset} />
    </SettingPage>
  );
};

export default Asset;
