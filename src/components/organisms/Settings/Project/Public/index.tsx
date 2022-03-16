import React from "react";
import { useIntl } from "react-intl";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import BasicAuthSection from "@reearth/components/molecules/Settings/Project/BasicAuthSection";
import PublicSection from "@reearth/components/molecules/Settings/Project/PublicSection";
import PublishSection from "@reearth/components/molecules/Settings/Project/PublishSection";
import StatusSection from "@reearth/components/molecules/Settings/Project/StatusSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetModal from "@reearth/components/organisms/Common/AssetModal";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  projectId: string;
};

const Public: React.FC<Props> = ({ projectId }) => {
  const intl = useIntl();
  const {
    currentTeam,
    currentProject,
    projectAlias,
    projectStatus,
    project,
    updateProjectBasicAuth,
    publishProject,
    validAlias,
    checkProjectAlias,
    validatingAlias,
    loading,
    updatePublicTitle,
    updatePublicDescription,
    updatePublicImage,
    assetModalOpened,
    toggleAssetModal,
  } = useHooks({ projectId });

  return (
    <SettingPage teamId={currentTeam?.id} projectId={projectId}>
      <SettingsHeader
        currentProject={currentProject?.name}
        title={intl.formatMessage({ defaultMessage: "Public" })}
      />
      {!project?.isArchived ? (
        <>
          <StatusSection projectStatus={projectStatus} />
          <BasicAuthSection
            onSave={updateProjectBasicAuth}
            isBasicAuthActive={project?.isBasicAuthActive}
            basicAuthUsername={project?.basicAuthUsername ?? ""}
            basicAuthPassword={project?.basicAuthPassword ?? ""}
          />
          <PublicSection
            currentProject={project}
            updatePublicTitle={updatePublicTitle}
            updatePublicDescription={updatePublicDescription}
            updatePublicImage={updatePublicImage}
            toggleAssetModal={toggleAssetModal}
            assetModal={
              <AssetModal
                teamId={currentTeam?.id}
                isOpen={assetModalOpened}
                onSelect={updatePublicImage}
                toggleAssetModal={toggleAssetModal}
              />
            }
          />
          <PublishSection
            loading={loading}
            projectAlias={projectAlias}
            publicationStatus={projectStatus}
            onPublish={publishProject}
            validAlias={validAlias}
            onAliasValidate={checkProjectAlias}
            validatingAlias={validatingAlias}
          />
        </>
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Public;
