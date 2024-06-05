import { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";

import { Breadcrumb, BreadcrumbProp, ItemsProp } from ".";

const meta: Meta<BreadcrumbProp> = {
  component: Breadcrumb,
};

export default meta;

type Story = StoryObj<BreadcrumbProp>;

const defaultItems: ItemsProp[] = [
  {
    title: "First",
  },
  {
    title: "Second",
  },
  {
    title: "Third",
  },
];

const itemMenu: ItemsProp[] = [
  {
    title: "Workspace",
    menuItems: [
      {
        title: "Item1",
        path: "/item",
      },
      {
        title: "Item1",
        path: "/item",
      },
      {
        title: "Item1",
        path: "/item",
      },
    ],
  },
  {
    title: "Project",
    menuItems: [
      {
        title: "Item2",
      },
      {
        title: "Item2",
      },
    ],
  },
  {
    title: "Sample",
  },
];

const items: ItemsProp[] = [
  {
    title: "Page1",
    icon: "data",
    menuItems: [
      {
        title: "Item1",
        path: "/settings",
        icon: "setting",
      },
      {
        title: "Item1",
        path: "/item",
        icon: "desktop",
      },
    ],
  },
  {
    title: "Page 2",
    menuItems: [
      {
        title: "Item2",
        icon: "file",
      },
      {
        title: "Item2",
      },
    ],
  },
  {
    title: "Page 3",
    icon: "folderSimple",
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "10vh" }}>
      <Breadcrumb items={defaultItems} />
    </div>
  ),
};

export const DropdownMenu: Story = {
  render: () => (
    <BrowserRouter>
      <div style={{ margin: "5px", height: "10vh" }}>
        <Breadcrumb items={itemMenu} />
      </div>
    </BrowserRouter>
  ),
};

export const UsecaseIcon: Story = {
  render: () => (
    <BrowserRouter>
      <div style={{ margin: "5px", height: "10vh" }}>
        <Breadcrumb items={items} />
      </div>
    </BrowserRouter>
  ),
};
