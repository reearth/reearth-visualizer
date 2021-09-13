import { Story, Meta } from "@storybook/react";
import React from "react";

import Component, { Props } from ".";

export default {
  title: "atoms/HelpButton",
  component: Component,
} as Meta;

const descriptionTitle = "Title";
const description = "Description";
const img = {
  imagePath: `${process.env.PUBLIC_URL}/sample.svg`,
  alt: "sample image",
};

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {
  description: description,
  descriptionTitle: descriptionTitle,
  img: img,
};
