import { Meta, StoryObj } from "@storybook/react";
import { FC, useCallback, useState } from "react";

import { TabItems, Tabs as TabsMenu, TabsProps } from ".";

const meta: Meta<TabsProps> = {
  component: TabsMenu,
};

export default meta;

type Story = StoryObj<TabsProps>;

const Tabs: FC<{ position?: "top" | "left" }> = ({ position }) => {
  const [activeTab, setActiveTab] = useState("tab1");
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
  }, []);

  return (
    <TabsMenu position={position} activeTab={activeTab} tabs={tabs} onChange={handleTabChange} />
  );
};
const tabs: TabItems[] = [
  {
    id: "tab1",
    name: "Tab One",
    children: (
      <div>
        <p>Here is tab one content</p>
        <p>Here is tab one content</p>
        <p>Here is tab one content</p>
      </div>
    ),
  },
  {
    id: "tab2",
    name: "Tab Two",
    icon: "editor",
    children: <div>This is tab two content</div>,
  },
  {
    id: "tab3",
    name: "Tab Three",
    children: <div>Content for Tab 3 </div>,
  },
];

export const Default: Story = {
  render: arg => (
    <div style={{ width: "500px", marginTop: "10px", marginLeft: "10px" }}>
      <Tabs position={arg.position} />
    </div>
  ),
  args: {
    position: "top",
  },
};

export const LeftSide: Story = {
  render: arg => (
    <div style={{ width: "500px" }}>
      <Tabs position={arg.position} />
    </div>
  ),
  args: {
    position: "left",
  },
};
