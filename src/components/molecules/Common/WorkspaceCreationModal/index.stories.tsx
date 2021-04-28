import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import WorkSpaceCreationModal from ".";

export default {
  title: "molecules/Common/WorkSpaceCreationModal",
  component: WorkSpaceCreationModal,
} as Meta;

export const Default = () => (
  <WorkSpaceCreationModal open onClose={action("onClose")} onSubmit={action("onSubmit")} />
);
