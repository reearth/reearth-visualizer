import { FC } from "react";

import { Button, PopupMenu, TextInput } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import useHooks from "./hooks";
import { ProjectProps } from "./types";

const ProjectGridViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  isStarred,
  onProjectOpen,
  onProjectSelect,
  onProjectStarClick,
  onProjectUpdate,
}) => {
  const theme = useTheme();

  const {
    projectName,
    popupMenu,
    isEditing,
    isHovered,
    handleProjectNameChange,
    handleProjectNameBlur,
    handleOnHover,
    handleProjectNameDoubleClick,
  } = useHooks({
    project,
    selectedProjectId,
    onProjectUpdate,
    onProjectSelect,
  });

  return (
    <Card>
      <CardImage
        backgroundImage={project.imageUrl}
        onDoubleClick={onProjectOpen}
        onClick={e => onProjectSelect?.(e, project.id)}
        isHovered={isHovered ?? false}
        onMouseEnter={() => handleOnHover?.(true)}
        onMouseLeave={() => handleOnHover?.(false)}
        isSelected={selectedProjectId === project.id}>
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
      </CardImage>
      <CardFooter>
        <CardTitleWrapper>
          {!isEditing ? (
            <CardTitle onDoubleClick={handleProjectNameDoubleClick}>{projectName}</CardTitle>
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
          label={<Button icon="dotsThreeVertical" iconButton appearance="simple" shadow={false} />}
        />
      </CardFooter>
    </Card>
  );
};

export default ProjectGridViewItem;

const Card = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  height: "220px",
}));

const CardImage = styled("div")<{
  backgroundImage?: string | null;
  isSelected: boolean;
  isHovered: boolean;
}>(({ theme, backgroundImage, isSelected, isHovered }) => ({
  flex: 1,
  position: "relative",
  background: backgroundImage ? `url(${backgroundImage}) center/cover` : theme.bg[1],
  borderRadius: theme.radius.normal,
  boxSizing: "border-box",
  cursor: "pointer",
  border: `1px solid ${
    isSelected ? theme.select.main : isHovered ? theme.outline.weak : "transparent"
  }`,
}));

const StarButtonWrapper = styled("div")<{
  isSelected: boolean;
  isStarred: boolean;
  isHovered: boolean;
}>(({ isSelected, isStarred, isHovered }) => ({
  position: "absolute",
  top: "10px",
  right: "10px",
  opacity: isSelected || isStarred || isHovered ? 1 : 0,
}));

const CardFooter = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
}));

const CardTitleWrapper = styled("div")(() => ({
  flex: 1,
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
  cursor: "pointer",
}));
