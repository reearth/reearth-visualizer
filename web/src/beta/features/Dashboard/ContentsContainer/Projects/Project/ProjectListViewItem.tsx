import {
  Button,
  PopupMenu,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { formatRelativeTime } from "@reearth/beta/utils/time";
import { useMeFetcher } from "@reearth/services/api";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, MouseEvent, useMemo } from "react";

import ProjectRemoveModal from "../ProjectRemoveModal";

import useHooks from "./hooks";
import { ProjectProps } from "./types";

const ProjectListViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  onProjectOpen,
  onProjectSelect,
  onProjectUpdate,
  onProjectRemove
}) => {
  const theme = useTheme();
  const { useMeQuery } = useMeFetcher();
  const { me } = useMeQuery();

  const createAt = useMemo(() => {
    return project.createdAt
      ? formatRelativeTime(new Date(project.createdAt), me.lang)
      : "";
  }, [me.lang, project.createdAt]);
  const UpdatedAt = useMemo(
    () =>
      project.updatedAt
        ? formatRelativeTime(new Date(project.updatedAt), me.lang)
        : "",
    [me.lang, project.updatedAt]
  );

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
      <ListWrapper
        data-testid={`project-list-item-${project.name}`}
        onClick={(e) => onProjectSelect?.(e, project.id)}
        isHovered={isHovered ?? false}
        onDoubleClick={onProjectOpen}
        onMouseEnter={() => handleProjectHover?.(true)}
        onMouseLeave={() => handleProjectHover?.(false)}
        isSelected={selectedProjectId === project.id}
      >
        <ThumbnailCol
          data-testid={`project-list-item-thumbnail-col-${project.name}`}
        >
          <ActionWrapper
            data-testid={`project-list-item-action-wrapper-${project.name}`}
          >
            <StarButtonWrapper
              isStarred={isStarred ?? false}
              isHovered={isHovered ?? false}
              data-testid={`project-list-item-star-btn-wrapper-${project.name}`}
            >
              <Button
                iconButton
                icon={isStarred ? "starFilled" : "star"}
                onClick={(e) => handleProjectStarClick?.(e)}
                iconColor={isStarred ? theme.warning.main : theme.content.main}
                appearance="simple"
                data-testid={`project-list-item-star-btn-${project.name}`}
              />
            </StarButtonWrapper>
            <ProjectImage
              backgroundImage={project.imageUrl}
              data-testid={`project-list-item-image-${project.name}`}
            />
          </ActionWrapper>
        </ThumbnailCol>
        <ProjectNameCol
          data-testid={`project-list-item-name-col-${project.name}`}
        >
          <PublishStatus
            status={hasMapOrStoryPublished}
            data-testid={`project-list-item-publish-status-${project.name}`}
          />
          {!isEditing ? (
            <TitleWrapper
              onDoubleClick={handleProjectNameDoubleClick}
              data-testid={`project-list-item-title-${project.name}`}
            >
              {projectName}
            </TitleWrapper>
          ) : (
            <TextInput
              onChange={handleProjectNameChange}
              onBlur={handleProjectNameBlur}
              value={projectName}
              autoFocus={isEditing}
              appearance="present"
              data-testid={`project-list-item-title-input-${project.name}`}
            />
          )}
        </ProjectNameCol>
        <TimeCol data-testid={`project-list-item-updated-col-${project.name}`}>
          <Typography
            size="body"
            data-testid={`project-list-item-updated-${project.name}`}
          >
            {UpdatedAt}
          </Typography>
        </TimeCol>
        <TimeCol data-testid={`project-list-item-created-col-${project.name}`}>
          <Typography
            size="body"
            data-testid={`project-list-item-created-${project.name}`}
          >
            {createAt}
          </Typography>
        </TimeCol>
        <ActionCol
          data-testid={`project-list-item-action-col-${project.name}`}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
          }}
        >
          <PopupMenu
            menu={popupMenu}
            label={
              <Button
                icon="dotsThreeVertical"
                iconButton
                appearance="simple"
                data-testid={`project-list-item-menu-btn-${project.name}`}
              />
            }
            data-testid={`project-list-item-menu-${project.name}`}
          />
        </ActionCol>
      </ListWrapper>
      {projectRemoveModalVisible && (
        <ProjectRemoveModal
          isVisible={projectRemoveModalVisible}
          onClose={() => handleProjectRemoveModal(false)}
          onProjectRemove={() => handleProjectRemove(project.id)}
          data-testid={`project-list-item-remove-modal-${project.name}`}
        />
      )}
    </>
  );
};

export default ProjectListViewItem;

const ListWrapper = styled("div")<{ isSelected: boolean; isHovered: boolean }>(
  ({ theme, isHovered }) => ({
    display: "flex",
    width: "100%",
    cursor: "pointer",
    borderRadius: theme.radius.small,
    border: `1px solid ${isHovered ? theme.outline.weak : "transparent"}`,
    padding: `${theme.spacing.small}px 0`,
    alignItems: "center",
    boxSizing: "border-box",
    overflow: "hidden"
  })
);

const ProjectImage = styled("div")<{ backgroundImage?: string | null }>(
  ({ theme, backgroundImage }) => ({
    background: backgroundImage
      ? `url(${backgroundImage}) center/cover`
      : theme.bg[1],
    borderRadius: theme.radius.normal,
    height: "32px",
    width: "55px"
  })
);

const ThumbnailCol = styled("div")(() => ({
  width: 120,
  flexShrink: 0
}));

const ActionWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small
}));

const ProjectNameCol = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  flex: 1,
  flexShrink: 0
}));

const PublishStatus = styled("div")<{ status?: boolean }>(
  ({ status, theme }) => ({
    height: "12px",
    width: "12px",
    borderRadius: "50%",
    background: status ? theme.publish.main : "transparent"
  })
);

const TimeCol = styled("div")(() => ({
  flex: "0 0 20%",
  flexShrink: 0
}));

const ActionCol = styled("div")(() => ({
  flex: "0 0 10%",
  flexShrink: 0
}));

const StarButtonWrapper = styled("div")<{
  isStarred: boolean;
  isHovered: boolean;
}>(({ isStarred, isHovered }) => ({
  opacity: isStarred || isHovered ? 1 : 0
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  cursor: "pointer",
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 1,
  overflow: "hidden",
  textOverflow: "ellipsis"
}));
