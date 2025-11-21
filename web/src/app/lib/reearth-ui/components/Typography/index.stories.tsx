import { Meta, StoryObj } from "@storybook/react-vite";

import { Typography } from ".";

const meta: Meta<typeof Typography> = {
  component: Typography
};

export default meta;

type Story = StoryObj<typeof Typography>;

export const Regular: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography size="h1">H1 Regular</Typography>
      <Typography size="h2">H2 Regular</Typography>
      <Typography size="h3">H3 Regular</Typography>
      <Typography size="h4">H4 Regular</Typography>
      <Typography size="h5">H5 Regular</Typography>
      <Typography size="body">Body Regular</Typography>
      <Typography size="footnote">Footnote Regular</Typography>
    </div>
  )
};

export const Medium: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography size="body" weight="medium">
        Body Medium
      </Typography>
    </div>
  )
};

export const Bold: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography size="h1" weight="bold">
        H1 Bold
      </Typography>
      <Typography size="h2" weight="bold">
        H2 Bold
      </Typography>
      <Typography size="h3" weight="bold">
        H3 Bold
      </Typography>
      <Typography size="h4" weight="bold">
        H4 Bold
      </Typography>
      <Typography size="h5" weight="bold">
        H5 Bold
      </Typography>
      <Typography size="body" weight="bold">
        Body Bold
      </Typography>
      <Typography size="footnote" weight="bold">
        Footnote Bold
      </Typography>
    </div>
  )
};
