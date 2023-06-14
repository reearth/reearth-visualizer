import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import React, { ReactNode } from "react";

import PublishStateSwitchField from ".";

export default {
  component: PublishStateSwitchField,
} as Meta;

type Story = StoryObj<typeof PublishStateSwitchField>;

const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ width: "174px", height: "24px" }}>{children}</div>
);
export const Default: Story = {
  args: {
    list: ["Unpublished", "Published"],
    onChange: action("onchange"),
  },
  render: args => {
    return (
      <Wrapper>
        <PublishStateSwitchField {...args} />
      </Wrapper>
    );
  },
};
