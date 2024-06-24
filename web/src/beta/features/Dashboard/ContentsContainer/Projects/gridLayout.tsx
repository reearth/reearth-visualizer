import { FC } from "react";

import { Button, PopupMenu, TextInput, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { LayoutProps } from ".";

export const GridLayout: FC<LayoutProps> = ({
  project,
  popupMenu,
  selectedProjectId,
  isStarred,
  isHovered,
  isEditing,
  projectName,
  onProjectOpen,
  onProjectSelect,
  onStarClick,
  onBlur,
  onChange,
  onDoubleClick,
  onHover,
}) => {
  const theme = useTheme();
  return (
    <Card>
      <CardImage
        backgroundImage={project.imageUrl}
        onDoubleClick={onProjectOpen}
        onClick={onProjectSelect}
        isHovered={isHovered ?? false}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
        isSelected={selectedProjectId === project.id}>
        <StarButtonWrapper
          isStarred={isStarred ?? false}
          isHovered={isHovered ?? false}
          isSelected={selectedProjectId === project.id}>
          <Button
            iconButton
            icon={isStarred ? "starFilled" : "star"}
            onClick={e => onStarClick?.(e, project.id)}
            iconColor={isStarred ? theme.warning.main : theme.content.main}
            appearance="simple"
          />
        </StarButtonWrapper>
      </CardImage>
      <CardFooter>
        <CardTitleWrapper>
          {!isEditing ? (
            <CardTitle onDoubleClick={onDoubleClick}>
              <Typography size="body">{projectName}</Typography>
            </CardTitle>
          ) : (
            <TextInput
              onChange={onChange}
              onBlur={onBlur}
              value={projectName}
              autoFocus={isEditing}
              appearance="present"
            />
          )}
        </CardTitleWrapper>
        <CardActions>
          <PopupMenu
            menu={popupMenu}
            label={<Button icon="dotsThreeVertical" iconButton appearance="simple" />}
          />
        </CardActions>
      </CardFooter>
    </Card>
  );
};

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
  padding: theme.spacing.small,
}));
const CardActions = styled("div")(() => ({}));
