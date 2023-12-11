import { Meta, StoryObj } from "@storybook/react";

import SidePanel from ".";

const meta: Meta<typeof SidePanel> = {
  component: SidePanel,
};

export default meta;

type Story = StoryObj<typeof SidePanel>;

export const Default: Story = {
  render: args => (
    <div style={{ height: "100vh" }}>
      <SidePanel {...args} />
    </div>
  ),
  args: {
    location: "left",
    contents: [
      {
        id: "Dummy1",
        title: "Dummy1",
        children: (
          <>
            {[...Array(100)].map((_, i) => (
              <div key={i}>scrollable / {i}</div>
            ))}
          </>
        ),
      },
      {
        id: "Dummy2",
        title: "Dummy2",
        maxHeight: "33%",
        children: (
          <>
            {[...Array(100)].map((_, i) => (
              <div key={i}>scrollable / {i}</div>
            ))}
          </>
        ),
      },
    ],
  },
};
