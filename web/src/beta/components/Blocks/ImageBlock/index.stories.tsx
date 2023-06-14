import { Meta, StoryObj } from "@storybook/react";

import ImageBlock from ".";

export default {
  component: ImageBlock,
} as Meta;

type Story = StoryObj<typeof ImageBlock>;

export const Default: Story = {
  render: () => <ImageBlock src={"http://placehold.it/150X150"} />,
};
export const Width200Cover: Story = {
  render: () => (
    <ImageBlock
      src={"http://placehold.it/150X150"}
      width={"200px"}
      height={"150px"}
      fit={"cover"}
    />
  ),
};
export const Height200Cover: Story = {
  render: () => (
    <ImageBlock
      src={"http://placehold.it/150X150"}
      width={"150px"}
      height={"200px"}
      fit={"cover"}
    />
  ),
};
export const Width200ContainLeft: Story = {
  render: () => (
    <ImageBlock
      src={"http://placehold.it/150X150"}
      width={"200"}
      height={"150px"}
      fit={"contain"}
      align="left"
    />
  ),
};
export const Height200Contain: Story = {
  render: () => (
    <ImageBlock
      src={"http://placehold.it/150X150"}
      width={"150px"}
      height={"200px"}
      fit={"contain"}
    />
  ),
};

export const Size200Cover: Story = {
  render: () => (
    <ImageBlock
      src={"http://placehold.it/150X150"}
      width={"200px"}
      height={"200px"}
      fit={"cover"}
    />
  ),
};

export const Size200Contain: Story = {
  render: () => (
    <ImageBlock
      src={"http://placehold.it/150X150"}
      width={"200px"}
      height={"200px"}
      fit={"contain"}
    />
  ),
};

export const Size200MaxHeight150Cover: Story = {
  render: () => (
    <ImageBlock
      src={"http://placehold.it/150X150"}
      width={"200px"}
      height={"200px"}
      maxHeight={"150px"}
      fit={"cover"}
    />
  ),
};

export const Size200MaxHeight150Contain: Story = {
  render: () => (
    <ImageBlock
      src={"http://placehold.it/150X150"}
      width={"200px"}
      height={"200px"}
      maxHeight={"150px"}
      fit={"contain"}
    />
  ),
};
