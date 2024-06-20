import { FC, useRef, MouseEvent } from "react";

import Loading from "@reearth/beta/components/Loading";
import { Button, PopupMenuItem, Selector, Typography } from "@reearth/beta/lib/reearth-ui";
import { onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { Project as ProjectType } from "../../type";

import useHooks from "./hooks";
import { Project } from "./project";
import { ProjectModal } from "./ProjectModal";

const options = [
  { value: "latestModified", label: "Latest modified" },
  { value: "date", label: "Date" },
];

export type Props = {
  workspaceId?: string;
};

export type LayoutProps = {
  project: ProjectType;
  popupMenu: PopupMenuItem[];
  selectedProjectId?: string;
  isStarred?: boolean;
  isEditing?: boolean;
  projectName?: string;
  onStarClick?: (e: MouseEvent<Element>, projectId: string) => void;
  onProjectOpen?: () => void;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
  onProjectSelect?: () => void;
  handleRename?: () => void;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onDoubleClick?: () => void;
};

export const Projects: FC<Props> = ({ workspaceId }) => {
  const t = useT();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    projects,
    projectLoading,
    hasMoreProjects,
    selectedProject,
    visible,
    viewState,
    isStarred,
    handleViewChange,
    handleGetMoreProjects,
    handleVisibility,
    handleProjectUpdate,
    handleProjectCreate,
    handleProjectOpen,
    handleProjectSelect,
    handleStarClick,
  } = useHooks(workspaceId);
  const theme = useTheme();

  return (
    <Wrapper>
      <Header>
        <Button
          title={t("New Project")}
          icon="plus"
          appearance="primary"
          onClick={handleVisibility}
        />
        <Actions>
          <Typography size="body">{t("Sort:")}</Typography>
          <Selector options={options} />
          <Button
            iconButton
            icon="grid"
            iconColor={viewState === "grid" ? theme.content.main : theme.content.weak}
            appearance="simple"
            onClick={() => handleViewChange("grid")}
          />
          <Button
            iconButton
            icon="list"
            iconColor={viewState === "list" ? theme.content.main : theme.content.weak}
            appearance="simple"
            onClick={() => handleViewChange("list")}
          />
        </Actions>
      </Header>
      <Contents
        ref={wrapperRef}
        onScroll={e => {
          !projectLoading && hasMoreProjects && onScrollToBottom(e, handleGetMoreProjects);
        }}>
        {viewState === "grid" && (
          <ProjectsWrapper viewState={viewState}>
            {projects.map(project => (
              <Project
                key={project.id}
                viewState={viewState}
                project={project}
                isStarred={isStarred[project.id] || false}
                onStarClick={handleStarClick}
                selectedProjectId={selectedProject?.id}
                onProjectUpdate={handleProjectUpdate}
                onProjectSelect={handleProjectSelect}
                onProjectOpen={() => handleProjectOpen(project.sceneId)}
              />
            ))}
          </ProjectsWrapper>
        )}
        {viewState === "list" && (
          <FlexTable>
            <FlexTableRow>
              <ActionCell />
              <ProjectNameCell>
                <Typography size="body" color={theme.content.weak}>
                  {t("Project Name")}
                </Typography>
              </ProjectNameCell>
              <TimeCell>
                <Typography size="body" color={theme.content.weak}>
                  {t("Last modified")}
                </Typography>
              </TimeCell>
              <TimeCell>
                <Typography size="body" color={theme.content.weak}>
                  {t("Created time")}
                </Typography>
              </TimeCell>
              <ActionCell />
            </FlexTableRow>
            <FlexTableBody>
              {projects.map(project => (
                <FlexTableRow key={project.id}>
                  <Project
                    key={project.id}
                    viewState={viewState}
                    project={project}
                    isStarred={isStarred[project.id] || false}
                    onStarClick={handleStarClick}
                    selectedProjectId={selectedProject?.id}
                    onProjectUpdate={handleProjectUpdate}
                    onProjectSelect={handleProjectSelect}
                    onProjectOpen={() => handleProjectOpen(project.sceneId)}
                  />
                </FlexTableRow>
              ))}
            </FlexTableBody>
          </FlexTable>
        )}
        {projectLoading && hasMoreProjects && <StyledLoading relative />}
      </Contents>
      {visible && (
        <ProjectModal
          visible={visible}
          onClose={handleVisibility}
          onProjectCreate={handleProjectCreate}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  gap: theme.spacing.large,
}));

const Header = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
}));

const Actions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
}));

const ProjectsWrapper = styled("div")<{ viewState: string }>(({ theme, viewState }) => ({
  display: viewState === "grid" ? "flex" : " ",
  flexWrap: "wrap",
  gap: theme.spacing.normal,
}));

const Contents = styled("div")(() => ({
  width: "100%",
  height: "100%",
  overflow: "auto",
}));

const StyledLoading = styled(Loading)`
  margin: 52px auto;
`;

const FlexTable = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
}));

const FlexTableBody = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}));

const FlexTableRow = styled("div")(() => ({
  display: "flex",
  width: "100%",
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
