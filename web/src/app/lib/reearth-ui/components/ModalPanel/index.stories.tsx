import { Meta, StoryObj } from "@storybook/react-vite";
import { FC } from "react";

import { Button } from "../Button";

import { ModalPanel, ModalPanelProps } from ".";

const meta: Meta<ModalPanelProps> = {
  component: ModalPanel
};

export default meta;

type Story = StoryObj<typeof ModalPanel>;

const MockChild: FC = () => (
  <div
    style={{
      color: "#e0e0e0",
      fontSize: "14px",
      width: "417px",
      padding: "24px"
    }}
  >
    <p>
      Lorem Ipsum is not simply random text. It has roots in a piece of
      classical Latin literature from 45 BC, making it over 2000 years old.
      Richard McClintock, a Latin professor at Hampden-Sydney College in
      Virginia, looked up one of the more obscure Latin words, consectetur, from
      a Lorem Ipsum passage,
    </p>
  </div>
);

export const Default: Story = {
  render: (args) => {
    return (
      <div style={{ width: "fit-content" }}>
        <ModalPanel {...args} />
      </div>
    );
  },
  args: {
    title: "Modal Panel Title",
    children: <MockChild />,
    actions: <Button title="Ok" appearance="primary" />
  }
};

export const MultipleActions: Story = {
  render: (args) => {
    return (
      <div style={{ width: "490px" }}>
        <ModalPanel {...args} />
      </div>
    );
  },
  args: {
    title: "Modal Panel Title",
    children: <MockChild />,
    actions: (
      <>
        <Button size="normal" title="Cancel" />
        <Button size="normal" title="Apply" appearance="primary" />
      </>
    )
  }
};
