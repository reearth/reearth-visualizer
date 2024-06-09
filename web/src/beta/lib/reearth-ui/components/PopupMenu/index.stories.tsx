import { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";

import { PopupMenu, PopupMenuProps, Items } from ".";

const meta: Meta<PopupMenuProps> = {
  component: PopupMenu,
};

export default meta;

type Story = StoryObj<PopupMenuProps>;

const defaultItems: Items[] = [
  {
    title: "First",
  },
  {
    title: "Second",
    path: "/second",
  },
  {
    title: "Third",
    path: "/third",
  },
];

const menuItems: Items[] = [
  {
    title: "Text",
    icon: "textT",
  },
  {
    title: "Image",
    icon: "imageFilled",
    subItem: [
      {
        title: "menu-item",
        icon: "book",
      },
      {
        title: "menu-item",
        icon: "book",
      },
    ],
  },
  {
    title: "Camera",
    icon: "camera",
  },
  {
    title: "Video",
    icon: "videoFilled",
  },
];

const multlevelItems: Items[] = [
  {
    title: "First Item",
    subItem: [
      {
        title: "sub menu-item",
      },
      {
        title: "sub menu-item",
      },
    ],
  },
  {
    title: "Second Item",
  },
  {
    title: "Third Item",
    subItem: [
      {
        title: "Third sub menu-item",
      },
      {
        title: "Third sub menu-item",
      },
    ],
  },
];

export const Default: Story = {
  render: () => (
    <BrowserRouter>
      <div style={{ margin: "5px", height: "100px" }}>
        <PopupMenu label="Dropsown Menu" menu={defaultItems} />
      </div>
    </BrowserRouter>
  ),
};

export const MultlevelMenu: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "100px" }}>
      <PopupMenu label="MultLevel Menu" menu={multlevelItems} width={200} />
    </div>
  ),
};

export const IconsMenu: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "120px" }}>
      <PopupMenu label="Menu" icon="plus" menu={menuItems} />
    </div>
  ),
};
