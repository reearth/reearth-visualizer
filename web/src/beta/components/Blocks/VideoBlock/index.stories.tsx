import { Meta, StoryObj } from "@storybook/react";

import VideoBlock from ".";

export default {
  component: VideoBlock,
} as Meta;

const Container: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ width: "430px" }}>{children}</div>
);

type Story = StoryObj<typeof VideoBlock>;

export const Default: Story = {
  args: {
    url: "https://placehold.co/1920x1080.mp4",
    controls: true,
  },
  render: args => {
    return (
      <Container>
        <VideoBlock {...args} />
      </Container>
    );
  },
};

export const Blank: Story = {
  args: {
    url: "",
  },
  render: args => {
    return (
      <Container>
        <VideoBlock {...args} />
      </Container>
    );
  },
};
