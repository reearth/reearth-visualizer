import { Collapse, Icon } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";

const StarredProject: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const t = useT();
  const theme = useTheme();
  const { starredProjects, handleProjectOpen } = useHooks(workspaceId);

  return (
    <Wrapper data-testid="starred-projects-wrapper">
      <Collapse
        iconPosition="left"
        title={t("Starred")}
        size="small"
        noPadding
        data-testid="starred-projects-collapse"
      >
        <ProjectsWrapper data-testid="starred-projects-list">
          {starredProjects?.map((project) =>
            project ? (
              <Item
                key={project.id}
                onClick={() => handleProjectOpen(project?.scene?.id)}
                data-testid={`starred-project-item-${project.id}`}
              >
                <IconWrapper
                  icon="notebook"
                  color={theme.content.weak}
                  data-testid={`starred-project-item-icon-${project.id}`}
                />
                <TitleWrapper
                  title={project?.name}
                  data-testid={`starred-project-item-title-${project.id}`}
                >
                  {project?.name}
                </TitleWrapper>
              </Item>
            ) : null
          )}
        </ProjectsWrapper>
      </Collapse>
    </Wrapper>
  );
};

export default StarredProject;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  paddingLeft: theme.spacing.smallest,
  flexGrow: 1,
  height: 0
}));

const ProjectsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: `0 ${theme.spacing.small}px`,
  flex: 1
}));

const Item = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  padding: theme.spacing.small,
  alignItems: "center",
  alignSelf: "stretch",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.bg[2],
    borderRadius: theme.radius.small
  }
}));

const IconWrapper = styled(Icon)(() => ({
  flexShrink: 0
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}));
