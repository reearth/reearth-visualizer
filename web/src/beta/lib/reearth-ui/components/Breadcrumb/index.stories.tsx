import { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";

import { Breadcrumb, BreadcrumbProp, ItemsProp } from ".";

const meta: Meta<BreadcrumbProp> = {
  component: Breadcrumb,
};

export default meta;

type Story = StoryObj<BreadcrumbProp>;

const breadcrumbItems: ItemsProp[] = [
  {
    title: "pages",
    icon: "folderSimple",
  },
  {
    title: "Sub-page",
  },
  {
    title: "Second-sub-page",
  },
];

const items: ItemsProp[] = [
  {
    title: "Pages",
    menuItems: [
      {
        title: "Sub-page",
        path: "/settings/project",
      },
      {
        title: "Sub-page1",
        path: "/settings/project",
      },
    ],
  },
  {
    title: "Page 2",
    menuItems: [
      {
        title: "Sub-page",
      },
      {
        title: "Sub-page2",
      },
    ],
  },
  {
    title: "Page 3",
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "10vh" }}>
      <Breadcrumb items={breadcrumbItems} />
    </div>
  ),
};

export const DropdownMenu: Story = {
  render: () => (
    <BrowserRouter>
      <div style={{ margin: "5px", height: "10vh" }}>
        <Breadcrumb items={items} />
      </div>
    </BrowserRouter>
  ),
};
