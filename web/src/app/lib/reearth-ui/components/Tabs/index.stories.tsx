import { Meta, StoryObj } from "@storybook/react-vite";
import { FC } from "react";

import { TabItem, Tabs as TabsMenu, TabsProps } from ".";

const meta: Meta<TabsProps> = {
  component: TabsMenu
};

export default meta;

type Story = StoryObj<TabsProps>;

const Tabs: FC<TabsProps> = ({ position, tabs, tabStyle }) => {
  return <TabsMenu position={position} tabStyle={tabStyle} tabs={tabs} />;
};

const tabsItem: TabItem[] = [
  {
    id: "tab1",
    name: "Tab One",
    children: (
      <div>
        <p>Here is tab one content</p>
        <p>Here is tab one content</p>
      </div>
    )
  },
  {
    id: "tab2",
    name: "Tab Two",
    icon: "editor",
    children: <div>This is tab two content</div>
  },
  {
    id: "tab3",
    name: "Tab Three",
    children: <div>Content for Tab 3 </div>
  }
];

const tabsIcons: TabItem[] = [
  {
    id: "tab1",
    icon: "data",
    children: (
      <div>
        <p>Here is tab one content</p>
      </div>
    )
  },
  {
    id: "tab2",
    icon: "editor",
    children: <div>This is tab two content</div>
  },
  {
    id: "tab3",
    icon: "layers",
    children: <div>Content for Tab 3 </div>
  }
];

export const Default: Story = {
  render: (arg) => (
    <div style={{ width: "500px", marginTop: "10px", marginLeft: "10px" }}>
      <Tabs {...arg} />
    </div>
  ),
  args: {
    position: "top",
    tabs: tabsItem
  }
};

export const LeftSideTabs: Story = {
  render: (arg) => (
    <div style={{ width: "500px" }}>
      <Tabs {...arg} />
    </div>
  ),
  args: {
    position: "left",
    tabs: tabsItem,
    tabStyle: "separated"
  }
};

export const IconTabs: Story = {
  render: (arg) => (
    <div style={{ width: "500px", height: "100vh" }}>
      <Tabs {...arg} />
    </div>
  ),
  args: {
    position: "left",
    tabs: tabsIcons
  }
};
