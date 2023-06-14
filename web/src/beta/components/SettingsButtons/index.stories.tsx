import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import React, { ReactNode } from "react";

import SettingsButtons from ".";

export default {
  component: SettingsButtons,
} as Meta;

type Story = StoryObj<typeof SettingsButtons>;

const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ width: "120px" }}>{children}</div>
);

export const Default: Story = {
  args: {
    title: "Audio",
    icon: "audio",
    onBlock: action("onBlock"),
    onEdit: action("onEdit"),
    onSetting: action("onSetting"),
  },
  render: args => {
    return (
      <Wrapper>
        <SettingsButtons {...args} />
      </Wrapper>
    );
  },
};
