import {
  Button,
  PopupMenu,
  TextInput,
  Typography,
} from "@reearth/beta/lib/reearth-ui";
import { convertTimeToString } from "@reearth/beta/utils/time";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, MouseEvent, useMemo } from "react";

import useHooks from "./hooks";
import { ProjectProps } from "./types";

const ProjectListViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  onProjectOpen,
  onProjectSelect,
  onProjectUpdate,
}) => {
  const theme = useTheme();

  const createAt: Date = useMemo(
    () => (project.createdAt ? new Date(project.createdAt) : new Date()),
    [project.createdAt],
  );
  const UpdatedAt: Date = useMemo(
    () => (project.updatedAt ? new Date(project.updatedAt) : new Date()),
    [project.updatedAt],
  );

  const {
    projectName,
    popupMenu,
    isEditing,
    isHovered,
    isStarred,
    publishStatus,
    handleProjectNameChange,
    handleProjectNameBlur,
    handleProjectHover,
    handleProjectNameDoubleClick,
    handleProjectStarClick,
  } = useHooks({
    project,
    selectedProjectId,
    onProjectUpdate,
    onProjectSelect,
  });

  return (
    <ListWrapper
      onClick={e => onProjectSelect?.(e, project.id)}
      isHovered={isHovered ?? false}
      onDoubleClick={onProjectOpen}
      onMouseEnter={() => handleProjectHover?.(true)}
      onMouseLeave={() => handleProjectHover?.(false)}
      isSelected={selectedProjectId === project.id}>
      <ThumbnailCol>
        <ActionWrapper>
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
          <ProjectImage backgroundImage={project.imageUrl} />
          <PublishStatus status={publishStatus} />
        </ActionWrapper>
      </ThumbnailCol>
      <ProjectNameCol>
        {!isEditing ? (
          <TitleWrapper onDoubleClick={handleProjectNameDoubleClick}>
            {projectName}
          </TitleWrapper>
        ) : (
          <TextInput
            onChange={handleProjectNameChange}
            onBlur={handleProjectNameBlur}
            value={projectName}
            autoFocus={isEditing}
            appearance="present"
          />
        )}
      </ProjectNameCol>
      <TimeCol>
        <Typography size="body">{convertTimeToString(UpdatedAt)}</Typography>
      </TimeCol>
      <TimeCol>
        <Typography size="body">{convertTimeToString(createAt)}</Typography>
      </TimeCol>
      <ActionCol
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
        }}
      >
        <PopupMenu
          menu={popupMenu}
          label={
            <Button icon="dotsThreeVertical" iconButton appearance="simple" />
          }
        />
      </ActionCol>
    </ListWrapper>
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
    overflow: "hidden",
  }),
);

const ThumbnailCol = styled("div")(() => ({
  flex: "0 0 10%",
  flexShrink: 0,
}));

const ActionWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
}));

const StarButtonWrapper = styled("div")<{
  isSelected: boolean;
  isStarred: boolean;
  isHovered: boolean;
}>(({ isSelected, isStarred, isHovered }) => ({
  opacity: isSelected || isStarred || isHovered ? 1 : 0,
}));

const ProjectImage = styled("div")<{ backgroundImage?: string | null }>(
  ({ theme, backgroundImage }) => ({
    background: backgroundImage ? `url(${backgroundImage}) center/cover` : theme.bg[1],
    borderRadius: theme.radius.normal,
    height: "32px",
    width: "55px",
    flexShrink: 0,
  }),
);
const ProjectNameCol = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.micro,
  flex: "0 0 40%",
  flexGrow: 1,
}));

const TimeCol = styled("div")(() => ({
  flex: "0 0 20%",
  flexShrink: 0,
}));

const ActionCol = styled("div")(() => ({
  flex: "0 0 10%",
  flexShrink: 0,
}));

const PublishStatus = styled("div")<{ status?: boolean }>(({ status, theme }) => ({
  height: "12px",
  width: "12px",
  borderRadius: "50%",
  background: status ? theme.publish.main : "transparent",
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
  textOverflow: "ellipsis",
}));
