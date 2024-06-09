import { Meta, StoryObj } from "@storybook/react";

import { PopupMenu, Items as PopupItems } from "@reearth/beta/lib/reearth-ui";

import { Breadcrumb, BreadcrumbProp, ItemsProp } from "./";

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

const multiLevelItems: ItemsProp[] = [
  {
    title: "First Item",
    subItem: [
      {
        title: "Sub Item one",
        subItem: [
          {
            title: "Item one",
          },
          {
            title: "Item two",
          },
        ],
      },
      {
        title: "Sub Item two",
      },
      {
        title: "Sub Item three",
      },
    ],
  },
  {
    title: "Second Item",
  },
];

const itemMenu: ItemsProp[] = [
  {
    title: "First Item",
    subItem: [
      {
        title: "Sub Menu 1",
      },
      {
        title: "Sub Menu 2",
      },
    ],
  },
  {
    title: "Second Item",
  },
  {
    title: "Third Item",
  },
];

const renderPopupMenu = (items: ItemsProp[], level: number) => {
  return items.map(item => {
    if (item.subItem) {
      return {
        ...item,
        title: (
          <PopupMenu
            label={item.title as string}
            menu={item.subItem as PopupItems[]}
            nested={level > 0}
          />
        ),
        subItem: undefined,
      };
    }
    return item;
  });
};

export const Default: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "10vh" }}>
      <Breadcrumb items={defaultItems} />
    </div>
  ),
};

export const DropdownMenu: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "10vh" }}>
      <Breadcrumb items={renderPopupMenu(itemMenu, 0)} />
    </div>
  ),
};

export const MultiLevelMenu: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "10vh" }}>
      <Breadcrumb items={renderPopupMenu(multiLevelItems, 0)} />
    </div>
  ),
};
