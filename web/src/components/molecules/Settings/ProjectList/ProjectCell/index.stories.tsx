import { Meta } from "@storybook/react";

import ProjectCell, { Project } from ".";

const project: Project = {
  id: "1",
  name: "vis1",
  status: "published",
  description: "vis1",
};

export default {
  title: "molecules/ProjectList/ProjectCell",
  component: ProjectCell,
} as Meta;

export const Default = () => <ProjectCell project={project} />;
