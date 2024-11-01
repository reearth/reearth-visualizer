import { Meta, StoryObj } from "@storybook/react";
import { FC } from "react";

import { Button } from "../Button";

import { PopupPanel, PopupPanelProps } from ".";

const meta: Meta<PopupPanelProps> = {
  component: PopupPanel
};

export default meta;

type Story = StoryObj<typeof PopupPanel>;

const MockChild: FC = () => (
  <div style={{ color: "#e0e0e0", fontSize: "14px" }}>
    <p>Panel content</p>
    <p>Panel content</p>
    <p>Panel content</p>
    <p>Panel content</p>
  </div>
);

export const Dafault: Story = {
  args: {
    title: "Panel Title",
    children: <MockChild />
  }
};

export const Action: Story = {
  args: {
    title: "Panel Title",
    children: <MockChild />,
    actions: (
      <Button extendWidth size="small" title="Apply" appearance="primary" />
    )
  }
};

export const MultipleActions: Story = {
  args: {
    title: "Panel Title",
    children: <MockChild />,
    actions: (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "8px"
        }}
      >
        <Button extendWidth size="small" title="Cancel" />
        <Button extendWidth size="small" title="Apply" appearance="primary" />
      </div>
    )
  }
};
