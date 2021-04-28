import React from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import ProjectCreationModal, { Props } from ".";

export default {
  title: "molecules/ProjectList/ProjectCreationModal",
  component: ProjectCreationModal,
} as Meta;

export const Default: Story<Props> = args => (
  <ProjectCreationModal {...args} open onClose={action("onClose")} onSubmit={action("onSubmit")} />
);
