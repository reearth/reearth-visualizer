import React from "react";

import Button from "@reearth/components/atoms/Button";
import Loading from "@reearth/components/atoms/Loading";
import TabSection from "@reearth/components/atoms/TabSection";
import ProjectCreationModal from "@reearth/components/molecules/Common/ProjectCreationModal";
import MoleculeProjectList from "@reearth/components/molecules/Settings/ProjectList/ProjectList";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetModal from "@reearth/components/organisms/Common/AssetModal";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

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
    handleModalClose,
    createProject,
    selectProject,
    selectedAsset,
    assetModalOpened,
    toggleAssetModal,
    onAssetSelect,
    handleGetMoreProjects,
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
      <ProjectCreationModal
        open={modalShown}
        onClose={handleModalClose}
        onSubmit={createProject}
        toggleAssetModal={toggleAssetModal}
        selectedAsset={selectedAsset}
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
