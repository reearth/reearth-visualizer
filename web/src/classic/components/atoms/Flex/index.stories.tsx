import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "atoms/flex",
  component: Component,
} as Meta;

const ExampleDiv = () => (
  <>
    <div>hoge</div>
    <div>fuga</div>
  </>
);

export const SpaceBetween: Story<Props> = args => (
  <Component {...args}>
    <ExampleDiv />
  </Component>
);
export const GapChildren: Story<Props> = args => (
  <Component {...args}>
    <div>hoge</div>
    <div>fuga</div>
  </Component>
);
export const DirectionVertical: Story<Props> = args => (
  <Component {...args}>
    <ExampleDiv />
  </Component>
);

SpaceBetween.args = {
  justify: "space-between",
};

GapChildren.args = {
  gap: "20px",
};

DirectionVertical.args = {
  direction: "column",
};
