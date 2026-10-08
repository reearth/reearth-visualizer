import {
  Button,
  PopupMenu,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, MouseEvent } from "react";

import ProjectRemoveModal from "../ProjectModals/ProjectRemoveModal";

import useHooks from "./hooks";
import { EditorBadge } from "./ProjectEditorInfo";
import { ProjectProps } from "./types";
import useProjectEditors from "./useProjectEditors";

const ProjectListViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  projectVisibility,
  onProjectOpen,
  onProjectSelect,
  onProjectUpdate,
  onProjectRemove
}) => {
  const theme = useTheme();
  const { creator, lastEditor, updatedAtFull, createdAtFull } =
    useProjectEditors(project);

  const {
    projectName,
    popupMenu,
    isEditing,
    isHovered,
    isStarred,
    hasMapOrStoryPublished,
    projectRemoveModalVisible,
    isRemovingProject,
    handleProjectNameChange,
    handleProjectNameBlur,
    handleProjectHover,
    handleProjectNameDoubleClick,
    handleProjectStarClick,
    handleProjectRemoveModal,
    handleProjectRemove
  } = useHooks({
    project,
    onProjectUpdate,
    onProjectSelect,
    onProjectRemove
  });

  return (
    <>
      <ListWrapper
        data-testid={`project-list-item-${project.name}`}
        onClick={(e: React.MouseEvent) => onProjectSelect?.(e, project.id)}
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
          {/* Fixed-width slot so the visibility badges line up across rows
              regardless of name length. */}
          <NameSlot>
            {!isEditing ? (
              <TitleWrapper
                title={projectName}
                onDoubleClick={handleProjectNameDoubleClick}
                data-testid={`project-list-item-title-${project.name}`}
              >
                {projectName}
              </TitleWrapper>
            ) : (
              // Stop the click from bubbling to the row's onClick — otherwise
              // placing the cursor in the field also (re)selects the row.
              <div onClick={(e: MouseEvent) => e.stopPropagation()}>
                <TextInput
                  onChange={handleProjectNameChange}
                  onBlur={handleProjectNameBlur}
                  value={projectName}
                  autoFocus={isEditing}
                  appearance="present"
                  data-testid={`project-list-item-title-input-${project.name}`}
                />
              </div>
            )}
          </NameSlot>
          {projectVisibility && (
            <VisibilityButton
              data-testid={`project-list-item-visibility-button-${project.name}`}
            >
              {project?.visibility}
            </VisibilityButton>
          )}
        </ProjectNameCol>
        <DataCol
          data-testid={`project-list-item-last-updated-by-col-${project.name}`}
        >
          {lastEditor && (
            <EditorBadge editor={lastEditor} textColor={theme.content.main} />
          )}
        </DataCol>
        <DataCol data-testid={`project-list-item-updated-col-${project.name}`}>
          <Typography
            size="body"
            data-testid={`project-list-item-updated-${project.name}`}
          >
            {updatedAtFull}
          </Typography>
        </DataCol>
        <DataCol
          data-testid={`project-list-item-created-by-col-${project.name}`}
        >
          {creator && (
            <EditorBadge editor={creator} textColor={theme.content.main} />
          )}
        </DataCol>
        <DataCol data-testid={`project-list-item-created-col-${project.name}`}>
          <Typography
            size="body"
            data-testid={`project-list-item-created-${project.name}`}
          >
            {createdAtFull}
          </Typography>
        </DataCol>
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
          disabled={isRemovingProject}
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
    display: css.display.flex,
    width: "100%",
    cursor: css.cursor.pointer,
    borderRadius: theme.radius.small,
    border: `1px solid ${isHovered ? theme.outline.weak : "transparent"}`,
    padding: `${theme.spacing.small}px 0`,
    alignItems: css.alignItems.center,
    boxSizing: css.boxSizing.borderBox,
    overflow: css.overflow.hidden
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
  width: 96,
  flexShrink: 0
}));

const ActionWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small
}));

const ProjectNameCol = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  flex: 1,
  minWidth: 0
}));

const PublishStatus = styled("div")<{ status?: boolean }>(
  ({ status, theme }) => ({
    height: "12px",
    width: "12px",
    borderRadius: "50%",
    background: status ? theme.publish.main : "transparent"
  })
);

const DataCol = styled("div")(({ theme }) => ({
  flex: "0 0 12%",
  minWidth: 0,
  paddingRight: theme.spacing.small,
  boxSizing: css.boxSizing.borderBox
}));

const ActionCol = styled("div")(() => ({
  flex: "0 0 40px",
  display: css.display.flex,
  justifyContent: css.justifyContent.flexEnd
}));

const StarButtonWrapper = styled("div")<{
  isStarred: boolean;
  isHovered: boolean;
}>(({ isStarred, isHovered }) => ({
  opacity: isStarred || isHovered ? 1 : 0
}));

const NameSlot = styled("div")(() => ({
  flex: "0 1 200px",
  minWidth: 0
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  cursor: css.cursor.pointer,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  display: "-webkit-box",
  WebkitBoxOrient: css.webkitBoxOrient.vertical,
  WebkitLineClamp: css.webkitLineClamp["1"],
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis
}));

const VisibilityButton = styled("div")(({ theme }) => ({
  background: theme.bg[0],
  color: "#B1B1B1",
  borderRadius: theme.radius.small,
  padding: `0 ${theme.spacing.smallest + 2}px`,
  border: "1px solid #B1B1B1",
  fontSize: theme.fonts.sizes.footnote,
  lineHeight: "16px",
  textTransform: "capitalize",
  flexShrink: 0,
  width: "fit-content"
}));
