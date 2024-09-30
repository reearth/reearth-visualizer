import { Button, PopupMenu } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";
import { ProjectProps } from "./types";

const ProjectGridViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  onProjectOpen,
  onProjectSelect,
  onArchiveProject
}) => {
  const { popupMenu, isHovered, hasMapOrStoryPublished, handleProjectHover } =
    useHooks({
      project,
      selectedProjectId,
      onArchiveProject,
      onProjectSelect
    });

  return (
    <Card>
      <CardImage
        backgroundImage={project.imageUrl}
        onDoubleClick={onProjectOpen}
        onClick={(e) => onProjectSelect?.(e, project.id)}
        isHovered={isHovered ?? false}
        onMouseEnter={() => handleProjectHover?.(true)}
        onMouseLeave={() => handleProjectHover?.(false)}
        isSelected={selectedProjectId === project.id}
      />
      <CardFooter>
        {hasMapOrStoryPublished && <PublishStatus />}
        <PopupMenu
          menu={popupMenu}
          label={
            <Button icon="dotsThreeVertical" iconButton appearance="simple" />
          }
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
