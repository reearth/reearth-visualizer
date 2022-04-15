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
    validAlias,
    validatingAlias,
    loading,
    assetModalOpened,
    currentLanguage,
    currentTheme,
    updateProjectBasicAuth,
    publishProject,
    checkProjectAlias,
    updatePublicTitle,
    updatePublicDescription,
    updatePublicImage,
    toggleAssetModal,
    handleNotificationChange,
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
            projectId={projectId}
            loading={loading}
            projectAlias={projectAlias}
            publicationStatus={projectStatus}
            validAlias={validAlias}
            validatingAlias={validatingAlias}
            currentLanguage={currentLanguage}
            currentTheme={currentTheme}
            onPublish={publishProject}
            onAliasValidate={checkProjectAlias}
            onNotificationChange={handleNotificationChange}
          />
        </>
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Public;
