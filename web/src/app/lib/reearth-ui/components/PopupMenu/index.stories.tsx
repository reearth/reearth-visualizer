import { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";

import { Button } from "../Button";

import { PopupMenu, PopupMenuProps, PopupMenuItem } from ".";

const meta: Meta<PopupMenuProps> = {
  component: PopupMenu
};

export default meta;

type Story = StoryObj<PopupMenuProps>;

const defaultItems: PopupMenuItem[] = [
  {
    id: "1",
    title: "First"
  },
  {
    id: "2",
    title: "Second",
    path: "/second"
  },
  {
    id: "3",
    title: "Third",
    path: "/third"
  }
];

const menuItems: PopupMenuItem[] = [
  {
    id: "menu-1",
    title: "Text",
    icon: "textT"
  },
  {
    id: "menu-2",
    title: "Image",
    icon: "imageFilled",
    subItem: [
      {
        id: "2-a",
        title: "menu-item",
        icon: "book"
      },
      {
        id: "2-b",
        title: "menu-item",
        icon: "book"
      }
    ]
  },
  {
    id: "menu-3",
    title: "Camera",
    icon: "camera"
  },
  {
    id: "menu-4",
    title: "Video",
    icon: "videoFilled"
  }
];

const multlevelItems: PopupMenuItem[] = [
  {
    id: "item-1",
    title: "First Item",
    subItem: [
      {
        id: "1-a",
        title: "sub menu-item"
      },
      {
        id: "1-c",
        title: "sub menu-item"
      }
    ]
  },
  {
    id: "item-2",
    title: "Second Item"
  },
  {
    id: "item-3",
    title: "Third Item",
    subItem: [
      {
        id: "3-a",
        title: "Third sub menu-item"
      },
      {
        id: "3-b",
        title: "Third sub menu-item"
      }
    ]
  }
];

export const Default: Story = {
  render: () => (
    <BrowserRouter>
      <div style={{ margin: "5px", height: "100px" }}>
        <PopupMenu label="Dropdown Menu" menu={defaultItems} />
      </div>
    </BrowserRouter>
  )
};

export const CustomLabel: Story = {
  render: () => (
    <BrowserRouter>
      <div style={{ margin: "5px", height: "100px" }}>
        <PopupMenu
          label={<Button title="Custom Menu" iconRight="caretDown" />}
          menu={defaultItems}
        />
      </div>
    </BrowserRouter>
  )
};

export const MultilevelMenu: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "120px" }}>
      <PopupMenu
        label="Multilevel Menu"
        icon="data"
        menu={multlevelItems}
        width={200}
      />
    </div>
  )
};

export const IconsMenu: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "120px" }}>
      <PopupMenu
        label={
          <Button appearance="primary" iconButton={true} icon="settingFilled" />
        }
        menu={menuItems}
      />
    </div>
  )
};
