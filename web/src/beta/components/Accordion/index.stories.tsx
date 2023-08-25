import { Meta, StoryObj } from "@storybook/react";

import Accordion from ".";

const meta: Meta<typeof Accordion> = {
  component: Accordion,
};

export default meta;

type Story = StoryObj<typeof Accordion>;

const SampleHeading = <div style={{ color: "white", background: "black" }}>heading</div>;

const SampleContent = (
  <div style={{ color: "white", background: "black", padding: "20px" }}>hoge</div>
);

export const Default: Story = {
  render: () => (
    <Accordion
      items={[
        {
          id: "hoge",
          heading: SampleHeading,
          content: SampleContent,
        },
        {
          id: "hogefuga",
          heading: SampleHeading,
          content: SampleContent,
        },
      ]}
    />
  ),
};
