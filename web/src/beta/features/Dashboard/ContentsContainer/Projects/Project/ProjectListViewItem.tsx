import { FC, MouseEvent, useMemo } from "react";

import { Button, PopupMenu, TextInput, Typography } from "@reearth/beta/lib/reearth-ui";
import { convertTimeToString } from "@reearth/beta/utils/time";
import { styled, useTheme } from "@reearth/services/theme";

import useHooks from "./hooks";
import { ProjectProps } from "./types";

const ProjectListViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  isStarred,
  onProjectOpen,
  onProjectSelect,
  onProjectUpdate,
  onProjectStarClick,
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
    handleProjectNameChange,
    handleProjectNameBlur,
    handleProjectHover,
    handleProjectNameDoubleClick,
  } = useHooks({
    project,
    selectedProjectId,
    onProjectUpdate,
    onProjectSelect,
  });

  return (
    <StyledRow
      onClick={e => onProjectSelect?.(e, project.id)}
      isHovered={isHovered ?? false}
      onDoubleClick={onProjectOpen}
      onMouseEnter={() => handleProjectHover?.(true)}
      onMouseLeave={() => handleProjectHover?.(false)}
      isSelected={selectedProjectId === project.id}>
      <ActionCell>
        <FlexItem>
          <StarButtonWrapper
            isStarred={isStarred ?? false}
            isHovered={isHovered ?? false}
            isSelected={selectedProjectId === project.id}>
            <Button
              iconButton
              icon={isStarred ? "starFilled" : "star"}
              onClick={e => onProjectStarClick?.(e, project.id)}
              iconColor={isStarred ? theme.warning.main : theme.content.main}
              appearance="simple"
              shadow={false}
            />
          </StarButtonWrapper>
          <ProjectImage backgroundImage={project.imageUrl} />
        </FlexItem>
      </ActionCell>
      <ProjectNameCell>
        {!isEditing ? (
          <TitleWrapper onDoubleClick={handleProjectNameDoubleClick}>{projectName}</TitleWrapper>
        ) : (
          <TextInput
            onChange={handleProjectNameChange}
            onBlur={handleProjectNameBlur}
            value={projectName}
            autoFocus={isEditing}
            appearance="present"
          />
        )}
      </ProjectNameCell>
      <TimeCell>
        <Typography size="body">{convertTimeToString(UpdatedAt)}</Typography>
      </TimeCell>
      <TimeCell>
        <Typography size="body">{convertTimeToString(createAt)}</Typography>
      </TimeCell>
      <ActionCell
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
        }}>
        <PopupMenu
          menu={popupMenu}
          label={<Button icon="dotsThreeVertical" iconButton appearance="simple" shadow={false} />}
        />
      </ActionCell>
    </StyledRow>
  );
};

export default ProjectListViewItem;

const StyledRow = styled("div")<{ isSelected: boolean; isHovered: boolean }>(
  ({ isSelected, theme, isHovered }) => ({
    display: "flex",
    width: "100%",
    cursor: "pointer",
    borderRadius: theme.radius.small,
    border: `1px solid ${
      isSelected ? theme.select.main : isHovered ? theme.outline.weak : "transparent"
    }`,
    padding: `${theme.spacing.small}px 0`,
    gap: theme.spacing.small,
    alignItems: "center",
  }),
);

const ProjectImage = styled("div")<{ backgroundImage?: string | null }>(
  ({ theme, backgroundImage }) => ({
    background: backgroundImage ? `url(${backgroundImage}) center/cover` : theme.bg[1],
    borderRadius: theme.radius.normal,
    height: "32px",
    width: "55px",
  }),
);

const FlexItem = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
}));

const ActionCell = styled("div")(() => ({
  flex: 0.2,
}));

const ProjectNameCell = styled("div")(() => ({
  flex: 1,
}));

const TimeCell = styled("div")(() => ({
  flex: 0.5,
}));

const StarButtonWrapper = styled("div")<{
  isSelected: boolean;
  isStarred: boolean;
  isHovered: boolean;
}>(({ isSelected, isStarred, isHovered }) => ({
  opacity: isSelected || isStarred || isHovered ? 1 : 0,
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
