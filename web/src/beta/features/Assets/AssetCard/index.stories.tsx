import { Meta, StoryObj } from "@storybook/react";

import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";

import AssetCard from ".";

const meta: Meta<typeof AssetCard> = {
  component: AssetCard,
};

export default meta;

type Story = StoryObj<typeof AssetCard>;

export const Default: Story = {
  args: {
    selected: false,
    url: `/sample.svg`,
    name: "hoge",
  },
};

export const Selected: Story = {
  args: {
    url: `/sample.svg`,
    name: "hoge",
    selected: true,
  },
};

export const EditableName: Story = {
  args: {
    url: `/sample.svg`,
    name: "hoge",
    selected: true,
    isNameEditable: true,
    actionContent: (
      <PopoverMenuContent
        size="sm"
        items={[
          {
            name: "Delete",
            icon: "bin",
            onClick: undefined,
          },
        ]}
      />
    ),
  },
};
