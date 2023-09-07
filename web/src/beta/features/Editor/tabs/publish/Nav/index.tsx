import { useParams } from "react-router-dom";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import TabButton from "@reearth/beta/components/TabButton";
import Text from "@reearth/beta/components/Text";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import { getPublishStatus } from "@reearth/beta/utils/publish-status";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";
import PublishModal from "./PublishModal";
import { PublishStatus } from "./PublishModal/hooks";
import PublishStoryModal from "./PublishModal/storyPublishModal";

export { navbarHeight } from "@reearth/beta/features/Editor/SecondaryNav";

export type ProjectType = "default" | "story";

type Props = {
  projectId?: string;
  selectedProjectType?: ProjectType;
  onProjectTypeChange: (type: ProjectType) => void;
};
const Nav: React.FC<Props> = ({ projectId, selectedProjectType, onProjectTypeChange }) => {
  const t = useT();
  const { sceneId } = useParams<{ sceneId: string }>();
  const {
    publishing,
    publishStatus,
    publishStoryStatus,
    dropdownOpen,
    modalOpen,
    alias,
    storyAlias,
    validAlias,
    validatingAlias,
    publishProjectLoading,
    publishStoryLoading,
    handleModalOpen,
    handleModalClose,
    setDropdown,
    handleProjectPublish,
    handleProjectAliasCheck,
    handleOpenProjectSettings,
    handleStoryPublish,
  } = useHooks({ projectId, sceneId });

  const isStoryTabSelected = selectedProjectType === "story";
  const { publishedName, disablePublish, publishText, modelOpenProp } = getPublishStatus(
    publishStatus,
    publishStoryStatus,
    isStoryTabSelected,
    t,
  );

  return (
    <>
      <StyledSecondaryNav>
        <LeftSection>
          <TabButton
            selected={selectedProjectType === "default"}
            label={t("Scene")}
            onClick={() => onProjectTypeChange("default")}
          />
          <TabButton
            selected={selectedProjectType === "story"}
            label={t("Story")}
            onClick={() => onProjectTypeChange("story")}
          />
        </LeftSection>
        <Popover.Provider
          open={dropdownOpen}
          onOpenChange={() => setDropdown(!dropdownOpen)}
          placement="bottom-end">
          <Popover.Trigger asChild>
            <Publishing onClick={() => setDropdown(!dropdownOpen)}>
              <Status status={isStoryTabSelected ? publishStoryStatus : publishStatus} />
              <Text size="body" customColor>
                {publishText}
              </Text>
              <Icon icon="arrowDown" size={16} />
            </Publishing>
          </Popover.Trigger>
          <Popover.Content style={{ zIndex: 999 }}>
            <PopoverMenuContent
              size="sm"
              width="142px"
              items={[
                {
                  name: t("Unpublish"),
                  disabled: disablePublish,
                  onClick: () => handleModalOpen("unpublishing"),
                },
                {
                  name: publishedName,
                  onClick: () => handleModalOpen(modelOpenProp),
                },
                {
                  name: t("Publishing Settings"),
                  onClick: () => handleOpenProjectSettings(),
                },
              ]}
            />
          </Popover.Content>
        </Popover.Provider>
      </StyledSecondaryNav>
      {selectedProjectType === "story" ? (
        <PublishStoryModal
          isVisible={modalOpen}
          loading={publishStoryLoading}
          publishing={publishing}
          publishStoryStatus={publishStoryStatus}
          url={config()?.published?.split("{}")}
          storyAlias={storyAlias}
          onClose={handleModalClose}
          onPublish={handleStoryPublish}
        />
      ) : (
        <PublishModal
          isVisible={modalOpen}
          loading={publishProjectLoading}
          publishing={publishing}
          publishStatus={publishStatus}
          url={config()?.published?.split("{}")}
          projectAlias={alias}
          validAlias={validAlias}
          validatingAlias={validatingAlias}
          onClose={handleModalClose}
          onPublish={handleProjectPublish}
          onAliasValidate={handleProjectAliasCheck}
        />
      )}
    </>
  );
};

export default Nav;

const StyledSecondaryNav = styled(SecondaryNav)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 8px;
  padding-left: 8px;
`;

const LeftSection = styled.div`
  display: flex;
  gap: 4px;
`;

const Publishing = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.content.weak};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.4s;

  :hover {
    background: ${({ theme }) => theme.bg[2]};
    p {
      transition: all 0.4s;
      color: ${({ theme }) => theme.content.main};
    }
    * {
      opacity: 1;
    }
  }
`;

const Status = styled.div<{ status?: PublishStatus }>`
  opacity: 0.5;
  background: ${({ theme, status }) =>
    status === "published" || status === "limited" ? theme.select.strong : theme.bg[4]};
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;
