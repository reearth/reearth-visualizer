import { FC } from "react";

import { Button, PopupMenu, TextInput } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { LayoutProps } from ".";

export const GridLayour: FC<LayoutProps> = ({
  project,
  popupMenu,
  selectedProjectId,
  isStarred,
  isEditing,
  projectName,
  onProjectOpen,
  onProjectSelect,
  onStarClick,
  onBlur,
  onChange,
  onDoubleClick,
}) => {
  const theme = useTheme();
  return (
    <Card>
      <CardImage
        backgroundImage={project.imageUrl}
        onDoubleClick={onProjectOpen}
        onClick={onProjectSelect}
        isSelected={selectedProjectId === project.id}>
        <StarButtonWrapper isSelected={selectedProjectId === project.id}>
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
        <CardTitle>
          <TextInput
            onChange={onChange}
            onBlur={onBlur}
            value={projectName}
            disabled={!isEditing}
            appearance="present"
            autoFocus={isEditing}
            onDoubleClick={onDoubleClick}
          />
        </CardTitle>
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
  flex: "1 1 calc(25% - 10px)",
  maxWidth: "calc(25% - 10px)",
  "@media only screen and (max-width: 1200px)": {
    flex: "1 1 calc(33.33% - 10px)",
    maxWidth: "calc(33.33% - 10px)",
  },
  "@media only screen and (max-width: 900px)": {
    flex: "1 1 calc(50% - 10px)",
    maxWidth: "calc(50% - 10px)",
  },
  "@media only screen and (max-width: 600px)": {
    flex: "1 1 calc(50% - 10px)",
    maxWidth: "calc(50% - 10px)",
  },
}));

const CardImage = styled("div")<{ backgroundImage?: string | null; isSelected: boolean }>(
  ({ theme, backgroundImage, isSelected }) => ({
    position: "relative",
    background: backgroundImage ? `url(${backgroundImage}) center/cover` : theme.bg[1],
    borderRadius: theme.radius.normal,
    height: "171px",
    cursor: "pointer",
    border: isSelected ? `1px solid ${theme.select.main}` : "none",
    "&:hover": {
      border: isSelected ? `1px solid ${theme.select.main}` : `1px solid ${theme.outline.weak}`,
    },
    "&:hover > div": {
      opacity: 1,
    },
  }),
);

const StarButtonWrapper = styled("div")<{ isSelected: boolean }>(({ isSelected }) => ({
  position: "absolute",
  top: "10px",
  right: "10px",
  opacity: isSelected ? 1 : 0,
}));

const CardFooter = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
}));

const CardTitle = styled("div")(() => ({
  flex: 1,
}));

const CardActions = styled("div")(() => ({}));
