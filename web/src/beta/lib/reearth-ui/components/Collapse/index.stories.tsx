import { Meta, StoryObj } from "@storybook/react";

import { Collapse, CollapseProps } from ".";

const meta: Meta<CollapseProps> = {
  component: Collapse,
};

export default meta;
type Story = StoryObj<typeof Collapse>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "500px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <Collapse title="Default Collapse">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
      <Collapse title="Background Black Collapse" background="black">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
    </div>
  ),
};

export const SmallCollapse: Story = {
  render: () => (
    <div style={{ width: "500px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <Collapse title="Default Collapse" size="small">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
      <Collapse title="Background Black Collapse" background="black" size="small">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
    </div>
  ),
};

export const CollapseWithHeaderBg: Story = {
  render: () => (
    <div style={{ width: "500px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <Collapse title="Default Collapse" headerBg="#3B3CD0">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
      <Collapse
        title="Background Black Collapse"
        background="black"
        size="small"
        headerBg="#3B3CD0">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
    </div>
  ),
};

export const InitialAsCollapsed: Story = {
  render: () => (
    <div style={{ width: "500px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <Collapse title="Default Collapse" collapsed={true}>
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
    </div>
  ),
};
