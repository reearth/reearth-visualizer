import { FC } from "react";

import { Button } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { Panel } from "@reearth/beta/ui/layout";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { usePublishPage } from "../context";

import useHooks from "./hooks";
import PublishModal from "./PublishModal";

const PublishToolsPanel: FC = () => {
  const { id, sceneId, selectedProjectType, handleProjectTypeChange } = usePublishPage();
  const t = useT();

  const {
    publishing,
    publishStatus,
    modalOpen,
    alias,
    validAlias,
    validatingAlias,
    publishProjectLoading,
    handleModalOpen,
    handleModalClose,
    handleProjectPublish,
    handleProjectAliasCheck,
    handleNavigationToSettings,
  } = useHooks({ id, sceneId, selectedProjectType });

  return (
    <Panel extend>
      <StyledSecondaryNav>
        <LeftSection>
          <TabButtonWrapper>
            <EllipseWrapper>
              <Ellipse status={publishStatus} active={selectedProjectType === "default"} />
            </EllipseWrapper>
            <TabButton
              highlighted={selectedProjectType === "default"}
              title={t("Scene")}
              onClick={() => handleProjectTypeChange("default")}
            />
          </TabButtonWrapper>
          <TabButtonWrapper>
            <EllipseWrapper>
              <Ellipse status={publishStatus} active={selectedProjectType === "story"} />
            </EllipseWrapper>
            <TabButton
              highlighted={selectedProjectType === "story"}
              title={t("Story")}
              onClick={() => handleProjectTypeChange("story")}
            />
          </TabButtonWrapper>
        </LeftSection>
        <ButtonWrapper>
          {publishStatus === "unpublished" ? (
            <Button
              title={t("Publish")}
              icon="paperPlaneTilt"
              size="small"
              onClick={() => handleModalOpen("publishing")}
            />
          ) : (
            <>
              <Button
                title={t("Unpublish")}
                icon="lock"
                size="small"
                onClick={() => handleModalOpen("unpublishing")}
              />
              <Button
                title={t("Update")}
                icon="caretDoubleUp"
                size="small"
                onClick={() => handleModalOpen("updating")}
              />
            </>
          )}
        </ButtonWrapper>
      </StyledSecondaryNav>
      <PublishModal
        isVisible={modalOpen}
        loading={publishProjectLoading}
        publishing={publishing}
        publishStatus={publishStatus}
        url={config()?.published?.split("{}")}
        projectAlias={alias}
        validAlias={validAlias}
        validatingAlias={validatingAlias}
        onNavigateToSettings={handleNavigationToSettings}
        onClose={handleModalClose}
        onPublish={handleProjectPublish}
        onAliasValidate={handleProjectAliasCheck}
      />
    </Panel>
  );
};

export default PublishToolsPanel;

const StyledSecondaryNav = styled("div")(({ theme }) => ({
  width: "100%",
  height: "44px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px`,
}));

const LeftSection = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  height: "24px",
  width: "244px",
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  height: "28px",
}));

const TabButton = styled(EntryItem)({
  width: "100px",
  height: "44px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const TabButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.small,
  width: "116px",
}));

const Ellipse = styled("div")<{ status: string; active: boolean }>(({ theme, status, active }) => ({
  width: "8px",
  height: "8px",
  backgroundColor: active
    ? status !== "unpublished"
      ? "#24A148"
      : theme.content.weaker
    : theme.content.weaker,
  borderRadius: "50%",
}));

const EllipseWrapper = styled("div")({
  width: "8px",
});
