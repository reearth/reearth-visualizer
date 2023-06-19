import React from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import ProjectCell, {
  Project as ProjectType,
} from "@reearth/classic/components/molecules/Settings/ProjectList/ProjectCell";
import { metricsSizes } from "@reearth/classic/theme";
import { styled } from "@reearth/services/theme";

export type Project = ProjectType;

export type Props = {
  title?: string;
  projects?: Project[];
  loading?: boolean;
  onProjectSelect?: (project: Project) => void;
};

const ProjectList: React.FC<Props> = ({ loading, projects, onProjectSelect }) => {
  return (
    <ProjectListContainer>
      {loading ? (
        <Loading />
      ) : (
        projects?.map(project => (
          <ProjectCell project={project} key={project.id} onSelect={onProjectSelect} />
        ))
      )}
    </ProjectListContainer>
  );
};

const ProjectListContainer = styled.div`
  > * {
    margin-top: ${metricsSizes["4xl"]}px;
    margin-bottom: ${metricsSizes["4xl"]}px;
  }
`;

export default ProjectList;
