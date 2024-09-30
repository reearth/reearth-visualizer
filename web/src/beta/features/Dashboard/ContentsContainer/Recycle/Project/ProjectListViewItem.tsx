import { Button, PopupMenu, Typography } from "@reearth/beta/lib/reearth-ui";
import { formatRelativeTime } from "@reearth/beta/utils/time";
import { styled } from "@reearth/services/theme";
import { FC, MouseEvent, useMemo } from "react";

import useHooks from "./hooks";
import { ProjectProps } from "./types";

const ProjectListViewItem: FC<ProjectProps> = ({
  project,
  selectedProjectId,
  onProjectOpen,
  onProjectSelect,
  onArchiveProject
}) => {
  const createAt = useMemo(
    () =>
      project.createdAt ? formatRelativeTime(new Date(project.createdAt)) : "",
    [project.createdAt]
  );
  const UpdatedAt = useMemo(
    () =>
      project.updatedAt ? formatRelativeTime(new Date(project.updatedAt)) : "",
    [project.updatedAt]
  );

  const { popupMenu, isHovered, handleProjectHover } = useHooks({
    project,
    selectedProjectId,
    onArchiveProject,
    onProjectSelect
  });

  return (
    <ListWrapper
      onClick={(e) => onProjectSelect?.(e, project.id)}
      isHovered={isHovered ?? false}
      onDoubleClick={onProjectOpen}
      onMouseEnter={() => handleProjectHover?.(true)}
      onMouseLeave={() => handleProjectHover?.(false)}
      isSelected={selectedProjectId === project.id}
    >
      <ThumbnailCol>
        <ActionWrapper>
          <ProjectImage backgroundImage={project.imageUrl} />
        </ActionWrapper>
      </ThumbnailCol>
      <TimeCol>
        <Typography size="body">{UpdatedAt}</Typography>
      </TimeCol>
      <TimeCol>
        <Typography size="body">{createAt}</Typography>
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

const TimeCol = styled("div")(() => ({
  flex: "0 0 20%",
  flexShrink: 0
}));

const ActionCol = styled("div")(() => ({
  flex: "0 0 10%",
  flexShrink: 0
}));
