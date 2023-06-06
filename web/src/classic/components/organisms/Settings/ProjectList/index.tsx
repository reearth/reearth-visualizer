import React from "react";

import Button from "@reearth/classic/components/atoms/Button";
import Loading from "@reearth/classic/components/atoms/Loading";
import TabSection from "@reearth/classic/components/atoms/TabSection";
import ProjectCreationModal from "@reearth/classic/components/molecules/Common/ProjectCreationModal";
import ProjectTypeSelectionModal from "@reearth/classic/components/molecules/Common/ProjectTypeSelectionModal";
import MoleculeProjectList from "@reearth/classic/components/molecules/Settings/ProjectList/ProjectList";
import SettingsHeader from "@reearth/classic/components/molecules/Settings/SettingsHeader";
import AssetModal from "@reearth/classic/components/organisms/Common/AssetModal";
import SettingPage from "@reearth/classic/components/organisms/Settings/SettingPage";
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
