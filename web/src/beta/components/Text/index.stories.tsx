import { Meta, StoryObj } from "@storybook/react";

import Text from ".";

const meta: Meta<typeof Text> = {
  component: Text,
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Regular: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Text size="h1">H1 Regular</Text>
      <Text size="h2">H2 Regular</Text>
      <Text size="h3">H3 Regular</Text>
      <Text size="h4">H4 Regular</Text>
      <Text size="h5">H5 Regular</Text>
      <Text size="body">Body Regular</Text>
      <Text size="footnote">Footnote Regular</Text>
      <Text size="xFootnote">XFootnote Regular</Text>
    </div>
  ),
};

export const Medium: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Text size="h1" weight="medium">
        H1 Medium
      </Text>
      <Text size="h2" weight="medium">
        H2 Medium
      </Text>
      <Text size="h3" weight="medium">
        H3 Medium
      </Text>
      <Text size="h4" weight="medium">
        H4 Medium
      </Text>
      <Text size="h5" weight="medium">
        H5 Medium
      </Text>
      <Text size="body" weight="medium">
        Body Medium
      </Text>
      <Text size="footnote" weight="medium">
        Footnote Medium
      </Text>
      <Text size="xFootnote" weight="medium">
        XFootnote Medium
      </Text>
    </div>
  ),
};

export const Bold: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Text size="h1" weight="bold">
        H1 Bold
      </Text>
      <Text size="h2" weight="bold">
        H2 Bold
      </Text>
      <Text size="h3" weight="bold">
        H3 Bold
      </Text>
      <Text size="h4" weight="bold">
        H4 Bold
      </Text>
      <Text size="h5" weight="bold">
        H5 Bold
      </Text>
      <Text size="body" weight="bold">
        Body Bold
      </Text>
      <Text size="footnote" weight="bold">
        Footnote Bold
      </Text>
      <Text size="xFootnote" weight="bold">
        XFootnote Bold
      </Text>
    </div>
  ),
};
