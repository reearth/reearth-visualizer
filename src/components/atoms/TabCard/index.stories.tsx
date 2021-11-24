import { Meta, Story } from "@storybook/react";
import React from "react";

import TabCard, { Props } from ".";

export default {
  title: "atoms/TabCard",
  component: TabCard,
} as Meta;

const SampleBody = () => <div>Hello</div>;

export const Default: Story<Props> = args => (
  <TabCard {...args}>
    <SampleBody />
  </TabCard>
);
Default.args = {
  name: "Property",
};
