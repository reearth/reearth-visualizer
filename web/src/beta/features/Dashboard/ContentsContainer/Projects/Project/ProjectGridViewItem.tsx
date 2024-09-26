import {
  Button,
  PopupMenu,
  TextInput,
  Modal,
  ModalPanel
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import useHooks from "./hooks";
import { ProjectProps } from "./types";

const ProjectGridViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  onProjectOpen,
  onProjectSelect,
  onProjectUpdate
}) => {
  const t = useT();
  const theme = useTheme();

  const {
    projectName,
    popupMenu,
    isEditing,
    isHovered,
    isStarred,
    hasMapOrStoryPublished,
    handleProjectNameChange,
    handleProjectNameBlur,
    handleProjectHover,
    handleProjectNameDoubleClick,
    handleProjectStarClick,
    exportModalVisible,
    closeExportModal,
    handleExportProject
  } = useHooks({
    project,
    selectedProjectId,
    onProjectUpdate,
    onProjectSelect
  });

  const actions = useMemo(
    () => (
      <>
        <Button
          title={t("Cancel")}
          appearance={"secondary"}
          onClick={closeExportModal}
        />
        <Button
          title={t("Export")}
          appearance={"primary"}
          onClick={handleExportProject}
        />
      </>
    ),
    [handleExportProject, closeExportModal, t]
  );

  return (
    <>
      <Card>
        <CardImage
          backgroundImage={project.imageUrl}
          onDoubleClick={onProjectOpen}
          onClick={(e) => onProjectSelect?.(e, project.id)}
          isHovered={isHovered ?? false}
          onMouseEnter={() => handleProjectHover?.(true)}
          onMouseLeave={() => handleProjectHover?.(false)}
          isSelected={selectedProjectId === project.id}
        >
          <StarButtonWrapper
            isStarred={isStarred ?? false}
            isHovered={isHovered ?? false}
            isSelected={selectedProjectId === project.id}
          >
            <Button
              iconButton
              icon={isStarred ? "starFilled" : "star"}
              onClick={(e) => handleProjectStarClick?.(e)}
              iconColor={isStarred ? theme.warning.main : theme.content.main}
              appearance="simple"
            />
          </StarButtonWrapper>
        </CardImage>
        <CardFooter>
          {hasMapOrStoryPublished && <PublishStatus />}
          <CardTitleWrapper>
            {!isEditing ? (
              <CardTitle onDoubleClick={handleProjectNameDoubleClick}>
                {projectName}
              </CardTitle>
            ) : (
              <TextInput
                onChange={handleProjectNameChange}
                onBlur={handleProjectNameBlur}
                value={projectName}
                autoFocus={isEditing}
                appearance="present"
              />
            )}
          </CardTitleWrapper>
          <PopupMenu
            menu={popupMenu}
            label={
              <Button icon="dotsThreeVertical" iconButton appearance="simple" />
            }
          />
        </CardFooter>
      </Card>
      <Modal visible={exportModalVisible} size="small">
        <ModalPanel
          title={t("Export Project")}
          actions={actions}
          onCancel={closeExportModal}
          appearance="normal"
        >
          <ModalContent />
        </ModalPanel>
      </Modal>
    </>
  );
};

export default ProjectGridViewItem;

const Card = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  height: "220px",
  "@media (max-width: 567px)": {
    height: "171px"
  }
}));

const CardImage = styled("div")<{
  backgroundImage?: string | null;
  isSelected: boolean;
  isHovered: boolean;
}>(({ theme, backgroundImage, isHovered }) => ({
  flex: 1,
  position: "relative",
  background: backgroundImage
    ? `url(${backgroundImage}) center/cover`
    : theme.bg[1],
  borderRadius: theme.radius.normal,
  boxSizing: "border-box",
  cursor: "pointer",
  border: `1px solid ${isHovered ? theme.outline.weak : "transparent"}`
}));

const StarButtonWrapper = styled("div")<{
  isSelected: boolean;
  isStarred: boolean;
  isHovered: boolean;
}>(({ isSelected, isStarred, isHovered }) => ({
  position: "absolute",
  top: "10px",
  right: "10px",
  opacity: isSelected || isStarred || isHovered ? 1 : 0
}));

const CardFooter = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  padding: `0 ${theme.spacing.smallest}`
}));

const PublishStatus = styled("div")(({ theme }) => ({
  height: "12px",
  width: "12px",
  borderRadius: "50%",
  background: theme.publish.main
}));

const CardTitleWrapper = styled("div")(() => ({
  flex: 1
}));

const CardTitle = styled("div")(({ theme }) => ({
  flex: "1",
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  cursor: "pointer"
}));

const ModalContent = styled("div")(() => ({
  width: "100%",
  height: "272px"
}));
