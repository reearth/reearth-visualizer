import { FC, useState } from "react";

import { Button, PopupMenu, TextInput, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { LayoutProps } from ".";

export const ListLayout: FC<LayoutProps> = ({
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
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <StyledRow
      onClick={onProjectSelect}
      isHovered={isHovered}
      onDoubleClick={onProjectOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      isSelected={selectedProjectId === project.id}>
      <ActionCell>
        <FlexItem>
          <StarButtonWrapper isSelected={selectedProjectId === project.id} isHovered={isHovered}>
            <Button
              iconButton
              icon={isStarred ? "starFilled" : "star"}
              onClick={e => onStarClick?.(e, project.id)}
              iconColor={isStarred ? theme.warning.main : theme.content.main}
              appearance="simple"
            />
          </StarButtonWrapper>
          <ProjectImage backgroundImage={project.imageUrl} />
        </FlexItem>
      </ActionCell>
      <ProjectNameCell>
        <TextInput
          onChange={onChange}
          onBlur={onBlur}
          value={projectName}
          disabled={!isEditing}
          appearance="present"
          autoFocus={isEditing}
        />
      </ProjectNameCell>
      <TimeCell>
        <Typography size="body">{project.updatedAt}</Typography>
      </TimeCell>
      <TimeCell>
        <Typography size="body">{project.updatedAt}</Typography>
      </TimeCell>
      <ActionCell>
        <PopupMenu
          menu={popupMenu}
          label={<Button icon="dotsThreeVertical" iconButton appearance="simple" />}
        />
      </ActionCell>
    </StyledRow>
  );
};

const StyledRow = styled("div")<{ isSelected: boolean; isHovered: boolean }>(
  ({ isSelected, theme, isHovered }) => ({
    display: "flex",
    width: "100%",
    cursor: "pointer",
    borderRadius: theme.radius.small,
    border: isSelected
      ? `1px solid ${theme.select.main}`
      : isHovered
      ? `1px solid ${theme.outline.weak}`
      : "none",
    padding: theme.spacing.small,
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

const StarButtonWrapper = styled("div")<{ isSelected: boolean; isHovered: boolean }>(
  ({ isSelected, isHovered }) => ({
    opacity: isSelected || isHovered ? 1 : 0,
  }),
);