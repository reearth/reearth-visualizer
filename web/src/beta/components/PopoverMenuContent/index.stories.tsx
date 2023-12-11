import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import PopoverContent from ".";

const meta: Meta<typeof PopoverContent> = {
  component: PopoverContent,
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof PopoverContent>;

export const Default: Story = {
  args: {
    width: "200px",
    size: "md",
    items: [
      {
        icon: "copy",
        name: "Name",
        onClick: action("onClickItem"),
        isSelected: true,
      },
      {
        icon: "pencilSimple",
        name: "NameNameNameNameNameNameName",
        onClick: action("onClickItem"),
      },
      {
        name: "NameNameNameNameNameNameName",
        onClick: action("onClickItem"),
      },
      {
        icon: "trash",
        name: "Name",
        onClick: action("onClickItem"),
      },
      {
        icon: "gearSix",
        name: "NameNameNameNameNameNameName",
        onClick: action("onClickItem"),
      },
    ],
  },
};
