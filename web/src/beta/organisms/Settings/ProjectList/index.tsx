import React from "react";

import Button from "@reearth/beta/components/Button";
import Loading from "@reearth/beta/components/Loading";
import TabSection from "@reearth/beta/components/TabSection";
import AssetModal from "@reearth/beta/features/Modals/AssetModal";
import ProjectCreationModal from "@reearth/beta/molecules/Common/ProjectCreationModal";
import ProjectTypeSelectionModal from "@reearth/beta/molecules/Common/ProjectTypeSelectionModal";
import MoleculeProjectList from "@reearth/beta/molecules/Settings/ProjectList/ProjectList";
import SettingsHeader from "@reearth/beta/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/beta/organisms/Settings/SettingPage";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";

type Props = {
  workspaceId: string;
};

const ProjectList: React.FC<Props> = ({ workspaceId }) => {
  const t = useT();
  const {
    loading,
    currentProjects,
    totalProjects,
    loadingProjects,
    hasMoreProjects,
    modalShown,
    openModal,
    prjectType,
    prjTypeSelectOpen,
    handleModalClose,
    createProject,
    selectProject,
    selectedAsset,
    assetModalOpened,
    toggleAssetModal,
    onAssetSelect,
    handleGetMoreProjects,
    handlePrjTypeSelectModalClose,
    handleProjectTypeSelect,
  } = useHooks(workspaceId);

  type Tab = "Working";
  const headers = {
    Working: t("Total Projects") + "(" + (totalProjects ?? 0) + ")",
  };

  return (
    <SettingPage
      workspaceId={workspaceId}
      loading={loadingProjects}
      hasMoreItems={hasMoreProjects}
      onScroll={handleGetMoreProjects}>
      <SettingsHeader title={t("Project List")} />
      <TabSection<Tab>
        menuAlignment="top"
        initialSelected={"Working"}
        selected="Working"
        expandedMenuIcon={false}
        headers={headers}
        headerAction={
          <Button large buttonType="secondary" text={t("New Project")} onClick={openModal} />
        }>
        {{
          Working: (
            <MoleculeProjectList projects={currentProjects} onProjectSelect={selectProject} />
          ),
        }}
      </TabSection>
      <ProjectTypeSelectionModal
        open={prjTypeSelectOpen}
        onClose={handlePrjTypeSelectModalClose}
        onSubmit={handleProjectTypeSelect}
      />
      <ProjectCreationModal
        open={modalShown}
        onClose={handleModalClose}
        onSubmit={createProject}
        toggleAssetModal={toggleAssetModal}
        selectedAsset={selectedAsset}
        projectType={prjectType}
        assetModal={
          <AssetModal
            workspaceId={workspaceId}
            isOpen={assetModalOpened}
            onSelect={onAssetSelect}
            toggleAssetModal={toggleAssetModal}
          />
        }
      />
      {loading && <Loading portal overlay />}
    </SettingPage>
  );
};

export default ProjectList;
