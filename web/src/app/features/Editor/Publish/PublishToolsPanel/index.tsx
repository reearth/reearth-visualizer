import { Button } from "@reearth/app/lib/reearth-ui";
import { EntryItem } from "@reearth/app/ui/components";
import { Panel } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

import { usePublishPage } from "../context";

import { PublishStatus } from "./common";
import useHooks from "./hooks";
import PublishOrUpdateModal from "./PublishOrUpdateModal";
import UnpublishModal from "./UnpublishModal";

const PublishToolsPanel: FC = () => {
  const { projectId, sceneId, activeSubProject, handleActiveSubProjectChange } =
    usePublishPage();

  const t = useT();

  const {
    publishItems,
    publishItem,
    handlePublishItemSelect,
    unpublishModalVisible,
    setUnpublishModalVisible,
    publishModalVisible,
    setPublishModalVisible
  } = useHooks({
    projectId,
    sceneId,
    activeSubProject,
    handleActiveSubProjectChange
  });

  const [isPublishMode, setIsPublishMode] = useState(false);

  return (
    <Panel dataTestid="publish-tools-panel" extend>
      <StyledSecondaryNav>
        <LeftSection>
          {publishItems.map((item) => (
            <TabButtonWrapper key={item.id}>
              <StatusWrapper>
                <PublishStatus isPublished={item.isPublished} />
              </StatusWrapper>
              <TabButton
                highlighted={item.id === publishItem?.id}
                title={item.buttonTitle}
                onClick={() => handlePublishItemSelect(item.id)}
              />
            </TabButtonWrapper>
          ))}
        </LeftSection>
        {publishItem && (
          <ButtonWrapper>
            {!publishItem.isPublished ? (
              <Button
                title={t("Publish")}
                icon="paperPlaneTilt"
                size="small"
                onClick={() => {
                  setIsPublishMode(true);
                  setPublishModalVisible(true);
                }}
              />
            ) : (
              <>
                <Button
                  title={t("Unpublish")}
                  icon="lock"
                  size="small"
                  onClick={() => setUnpublishModalVisible(true)}
                />
                <Button
                  title={t("Update")}
                  icon="caretDoubleUp"
                  size="small"
                  onClick={() => {
                    setIsPublishMode(false);
                    setPublishModalVisible(true);
                  }}
                />
              </>
            )}
          </ButtonWrapper>
        )}
      </StyledSecondaryNav>
      {publishItem && unpublishModalVisible && (
        <UnpublishModal
          publishItem={publishItem}
          onClose={() => setUnpublishModalVisible(false)}
        />
      )}
      {publishItem && publishModalVisible && (
        <PublishOrUpdateModal
          publishItem={publishItem}
          isPublishMode={isPublishMode}
          onClose={() => setPublishModalVisible(false)}
        />
      )}
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
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px`
}));

const LeftSection = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.normal,
  height: "24px"
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  height: "28px"
}));

const TabButton = styled(EntryItem)({
  width: "100px",
  height: "44px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
});

const TabButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.small,
  minWidth: "116px"
}));

const StatusWrapper = styled("div")({
  width: "8px"
});
