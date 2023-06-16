import { action } from "@storybook/addon-actions";
import { Meta, Story } from "@storybook/react";

import ProjectTypeSelectionModal, { Props } from ".";

export default {
  title: "classic/molecules/common/ProjectTypeSelectionModal",
  component: ProjectTypeSelectionModal,
} as Meta;

export const Default: Story<Props> = args => (
  <ProjectTypeSelectionModal
    {...args}
    open
    onClose={action("onClose")}
    onSubmit={action("onSubmit")}
  />
);
