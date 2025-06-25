import {
  PopupMenu,
  PopupMenuItem as PopupItems
} from "@reearth/app/lib/reearth-ui";
import { Meta, StoryObj } from "@storybook/react";

import { Breadcrumb, BreadcrumbProp, BreadcrumbItem } from "./";

const meta: Meta<BreadcrumbProp> = {
  component: Breadcrumb
};

export default meta;

type Story = StoryObj<BreadcrumbProp>;

const defaultItems: BreadcrumbItem[] = [
  {
    title: "First"
  },
  {
    title: "Second"
  },
  {
    title: "Third"
  }
];

const multiLevelItems: BreadcrumbItem[] = [
  {
    title: "First Item",
    icon: "addStyle",
    subItem: [
      {
        id: "one",
        title: "Sub Item one",
        subItem: [
          {
            id: "sub-one",
            title: "Item one"
          },
          {
            id: "sub-two",
            title: "Item two"
          }
        ]
      },
      {
        id: "two",
        title: "Sub Item two"
      },
      {
        id: "three",
        title: "Sub Item three"
      }
    ]
  },
  {
    title: "Second Item"
  }
];

const itemMenu: BreadcrumbItem[] = [
  {
    title: "First Item",
    subItem: [
      {
        id: "one-1",
        title: "Sub Menu 1"
      },
      {
        id: "two-2",
        title: "Sub Menu 2"
      }
    ]
  },
  {
    title: "Second Item"
  },
  {
    title: "Third Item"
  }
];

const renderPopupMenu = (items: BreadcrumbItem[], level: number) => {
  return items.map((item) => {
    if (item.subItem) {
      return {
        ...item,
        title: (
          <PopupMenu
            label={item.title}
            menu={item.subItem as PopupItems[]}
            nested={level > 0}
          />
        ),
        subItem: undefined
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
  )
};

export const DropdownMenu: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "10vh" }}>
      <Breadcrumb items={renderPopupMenu(itemMenu, 0)} />
    </div>
  )
};

export const MultiLevelMenu: Story = {
  render: () => (
    <div style={{ margin: "5px", height: "10vh" }}>
      <Breadcrumb items={renderPopupMenu(multiLevelItems, 0)} />
    </div>
  )
};
