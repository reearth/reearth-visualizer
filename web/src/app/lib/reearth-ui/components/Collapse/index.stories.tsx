import { Meta, StoryObj } from "@storybook/react-vite";

import { Collapse, CollapseProps } from ".";

const meta: Meta<CollapseProps> = {
  component: Collapse
};

export default meta;
type Story = StoryObj<typeof Collapse>;

export const Default: Story = {
  render: () => (
    <div
      style={{
        width: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <Collapse title="Default Collapse">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
    </div>
  )
};

export const Small: Story = {
  render: () => (
    <div
      style={{
        width: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <Collapse title="Small Collapse" size="small">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
    </div>
  )
};

export const NoPadding: Story = {
  render: () => (
    <div
      style={{
        width: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <Collapse title="No Padding Collapse" noPadding>
        <p>User can manage the content freely.</p>
      </Collapse>
    </div>
  )
};

export const HeaderBg: Story = {
  render: () => (
    <div
      style={{
        width: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <Collapse title="Customized Header Background" headerBg="#3B3CD0">
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
    </div>
  )
};

export const InitialAsCollapsed: Story = {
  render: () => (
    <div
      style={{
        width: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <Collapse title="Collapsed" collapsed={true}>
        <p>Lorem ipsum dolor sit</p>
      </Collapse>
    </div>
  )
};
