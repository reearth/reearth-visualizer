import React from "react";

import ArchivedMessage from "@reearth/beta/molecules/Settings/Project/ArchivedMessage";
import BasicAuthSection from "@reearth/beta/molecules/Settings/Project/BasicAuthSection";
import PublicSection from "@reearth/beta/molecules/Settings/Project/PublicSection";
import PublishSection from "@reearth/beta/molecules/Settings/Project/PublishSection";
import StatusSection from "@reearth/beta/molecules/Settings/Project/StatusSection";
import SettingsHeader from "@reearth/beta/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/beta/organisms/Settings/SettingPage";
import AssetModal from "@reearth/classic/components/organisms/Common/AssetModal";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";

type Props = {
  projectId: string;
};

const Public: React.FC<Props> = ({ projectId }) => {
  const t = useT();
  const {
    currentWorkspace,
    currentProject,
    projectAlias,
    projectStatus,
    project,
    validAlias,
    validatingAlias,
    loading,
    assetModalOpened,
    currentLang,
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
    <SettingPage workspaceId={currentWorkspace?.id} projectId={projectId}>
      <SettingsHeader currentProject={currentProject?.name} title={t("Public")} />
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
                workspaceId={currentWorkspace?.id}
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
            currentLang={currentLang}
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
