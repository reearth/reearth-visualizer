import { Meta } from "@storybook/react";
import React from "react";

import ProjectList, { Project } from ".";

const visualizations: Project[] = [
  {
    id: "1",
    name: "vis1",
    status: "published",
    description: "this is a visualization",
  },
  {
    id: "2",
    name: "vis2",
    status: "limited",
    description: "this is a visualization",
  },
  {
    id: "3",
    name: "vis3",
    status: "unpublished",
    description: "this is a visualization",
  },
];

export default {
  title: "molecules/Settings/ProjectList/ProjectList",
  component: ProjectList,
} as Meta;

export const Default = () => <ProjectList projects={visualizations} />;
