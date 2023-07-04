import { Meta, StoryObj } from "@storybook/react";
import React, { ReactNode } from "react";

import SettingsButtons from ".";

export default {
  component: SettingsButtons,
} as Meta;

type Story = StoryObj<typeof SettingsButtons>;

const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ display: "flex" }}>{children}</div>
);

export const Default: Story = {
  args: {
    title: "Audio",
    icon: "audio",
  },
  render: args => {
    return (
      <Wrapper>
        <SettingsButtons {...args} />
      </Wrapper>
    );
  },
};
