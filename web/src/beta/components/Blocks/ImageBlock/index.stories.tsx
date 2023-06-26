import { Meta, StoryObj } from "@storybook/react";

import ImageBlock from ".";

export default {
  component: ImageBlock,
} as Meta;

const Container: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ width: "430px" }}>{children}</div>
);

type Story = StoryObj<typeof ImageBlock>;

export const Default: Story = {
  args: {
    src: "http://placehold.it/430X260",
  },
  render: args => {
    return (
      <Container>
        <ImageBlock {...args} />
      </Container>
    );
  },
};

export const Blank: Story = {
  args: {
    src: "",
  },
  render: args => {
    return (
      <Container>
        <ImageBlock {...args} />
      </Container>
    );
  },
};
