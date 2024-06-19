import { FC, useCallback, useRef, useState } from "react";

import Loading from "@reearth/beta/components/Loading";
import { Button, Selector, Typography } from "@reearth/beta/lib/reearth-ui";
import { onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Project } from "../../type";

import { Cards } from "./cards";
import { ProjectModal } from "./ProjectModal";

const options = [
  {
    value: "Latest modified",
    label: "Latest modified",
  },
  {
    value: "date",
    label: "Date",
  },
];

export type Props = {
  projects: Project[];
  isLoading?: boolean;
  hasMoreProjects?: boolean;
  onGetMoreProjects?: () => void;
  onUpdateProject: (project: Project, projectId: string) => void;
  onCreateProject: (data: Pick<Project, "name" | "description" | "imageUrl">) => void;
  onClickProject: (sceneId?: string) => void;
};

export const Projects: FC<Props> = ({
  projects,
  isLoading,
  hasMoreProjects,
  onCreateProject,
  onUpdateProject,
  onGetMoreProjects,
  onClickProject,
}) => {
  const t = useT();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const handleVisibility = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

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
          <Button iconButton icon="grid" appearance="simple" />
          <Button iconButton icon="list" appearance="simple" />
        </Actions>
      </Header>
      <Contents
        ref={wrapperRef}
        onScroll={e => {
          !isLoading && hasMoreProjects && onScrollToBottom(e, onGetMoreProjects);
        }}>
        <ProjectsWrapper>
          {projects.map((project, idx) => (
            <Cards
              key={idx}
              project={project}
              onUpdateProject={onUpdateProject}
              onClick={() => onClickProject(project.sceneId)}
            />
          ))}
          {isLoading && hasMoreProjects && <StyledLoading relative />}
        </ProjectsWrapper>
      </Contents>
      {visible && (
        <ProjectModal
          visible={visible}
          onClose={handleVisibility}
          onCreateProject={onCreateProject}
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

const ProjectsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
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
