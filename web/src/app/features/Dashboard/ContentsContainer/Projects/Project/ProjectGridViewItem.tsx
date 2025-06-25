import { Button, PopupMenu, TextInput } from "@reearth/app/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/app/ui/assets/defaultProjectBackgroundImage.webp";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

import ProjectRemoveModal from "../ProjectRemoveModal";

import useHooks from "./hooks";
import { ProjectProps } from "./types";

const ProjectGridViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  onProjectOpen,
  onProjectSelect,
  onProjectUpdate,
  onProjectRemove
}) => {
  const theme = useTheme();

  const {
    projectName,
    popupMenu,
    isEditing,
    isHovered,
    isStarred,
    hasMapOrStoryPublished,
    projectRemoveModalVisible,
    handleProjectNameChange,
    handleProjectNameBlur,
    handleProjectHover,
    handleProjectNameDoubleClick,
    handleProjectStarClick,
    handleProjectRemoveModal,
    handleProjectRemove
  } = useHooks({
    project,
    selectedProjectId,
    onProjectUpdate,
    onProjectSelect,
    onProjectRemove
  });

  return (
    <>
      <Card data-testid={`project-grid-item-${project.name}`}>
        <CardImage
          data-testid={`project-grid-item-image-${project.name}`}
          backgroundImage={project.imageUrl ?? defaultProjectBackgroundImage}
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
            data-testid={`project-grid-item-star-btn-wrapper-${project.name}`}
          >
            <Button
              iconButton
              icon={isStarred ? "starFilled" : "star"}
              onClick={(e) => handleProjectStarClick?.(e)}
              iconColor={isStarred ? theme.warning.main : theme.content.main}
              appearance="simple"
              data-testid={`project-grid-item-star-btn-${project.name}`}
            />
          </StarButtonWrapper>
        </CardImage>
        <CardFooter data-testid={`project-grid-item-footer-${project.name}`}>
          {hasMapOrStoryPublished && (
            <PublishStatus
              data-testid={`project-grid-item-publish-status-${project.name}`}
            />
          )}
          <CardTitleWrapper
            data-testid={`project-grid-item-title-wrapper-${project.name}`}
          >
            {!isEditing ? (
              <CardTitle
                onDoubleClick={handleProjectNameDoubleClick}
                data-testid={`project-grid-item-title-${project.name}`}
              >
                {projectName}
              </CardTitle>
            ) : (
              <TextInput
                onChange={handleProjectNameChange}
                onBlur={handleProjectNameBlur}
                value={projectName}
                autoFocus={isEditing}
                appearance="present"
                data-testid={`project-grid-item-title-input-${project.name}`}
              />
            )}
          </CardTitleWrapper>
          <PopupMenu
            menu={popupMenu}
            label={
              <Button
                icon="dotsThreeVertical"
                iconButton
                appearance="simple"
                data-testid={`project-grid-item-menu-btn-${project.name}`}
              />
            }
            data-testid={`project-grid-item-menu-${project.name}`}
          />
        </CardFooter>
      </Card>
      {projectRemoveModalVisible && (
        <ProjectRemoveModal
          isVisible={projectRemoveModalVisible}
          onClose={() => handleProjectRemoveModal(false)}
          onProjectRemove={() => handleProjectRemove(project.id)}
          data-testid={`project-grid-item-remove-modal-${project.name}`}
        />
      )}
    </>
  );
};

export default ProjectGridViewItem;

const Card = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "220px",
  "@media (max-width: 567px)": {
    height: "171px"
  }
});

const CardImage = styled("div")<{
  backgroundImage?: string | null;
  isSelected: boolean;
  isHovered: boolean;
}>(({ theme, backgroundImage, isHovered }) => ({
  flex: 1,
  position: "relative",
  background: backgroundImage ? `url(${backgroundImage}) center/cover` : "",
  backgroundColor: theme.bg[1],
  borderRadius: theme.radius.normal,
  boxSizing: "border-box",
  cursor: "pointer",
  boxShadow: `inset 0 0 0 1px ${isHovered ? theme.outline.weak : "transparent"}`
}));

const StarButtonWrapper = styled("div")<{
  isStarred: boolean;
  isHovered: boolean;
}>(({ isStarred, isHovered }) => ({
  position: "absolute",
  top: "10px",
  right: "10px",
  opacity: isStarred || isHovered ? 1 : 0
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
