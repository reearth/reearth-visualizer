import { Meta, StoryObj } from "@storybook/react";

import { IconButton } from "@reearth/beta/lib/reearth-ui";

import { EntryItem } from ".";

const meta: Meta<typeof EntryItem> = {
  component: EntryItem,
  decorators: [
    Story => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof EntryItem>;

export const Default: Story = {
  args: {
    title: "Item",
  },
};

export const Highlight: Story = {
  args: {
    title: "Item",
    highlight: true,
  },
};

export const Icon: Story = {
  args: {
    title: "Item",
    icon: "file",
  },
};

export const LongText: Story = {
  args: {
    title: "ItemNameWithALongLong Long Long LongLongLongLongName",
    icon: "file",
  },
};

export const OptionsMenu: Story = {
  args: {
    title: "Item",
    optionsMenu: [
      {
        id: "1",
        title: "Option 1",
        onClick: () => console.log("Option 1 clicked"),
      },
      {
        id: "2",
        title: "Option 2 with icon",
        icon: "setting",
        onClick: () => console.log("Option 2 clicked"),
      },
    ],
  },
};

export const HoverActions: Story = {
  args: {
    title: "Item",
    hoverActions: [
      <IconButton
        key="1"
        icon="setting"
        size="small"
        appearance="simple"
        onClick={() => console.log("Action 1 clicked")}
      />,
      <IconButton
        key="2"
        icon="pencilSimple"
        size="small"
        appearance="simple"
        onClick={() => console.log("Action 2 clicked")}
      />,
    ],
  },
};
