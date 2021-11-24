import { Meta, Story } from "@storybook/react";
import React from "react";

import DatasetInfoPane, { Props } from ".";

export default {
  title: "molecules/EarthEditor/DatasetInfoPane",
  component: DatasetInfoPane,
} as Meta;

export const Default: Story<Props> = args => {
  return <DatasetInfoPane {...args} />;
};

Default.args = {};
