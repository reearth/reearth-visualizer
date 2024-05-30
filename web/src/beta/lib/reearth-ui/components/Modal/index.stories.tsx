import { Meta, StoryObj } from "@storybook/react";

import { Button } from "../Button";
import { ModalPanel } from "../ModalPanel";

import { ModalProps, Modal } from ".";

const meta: Meta<ModalProps> = {
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const SmallSize: Story = {
  render: args => {
    return <Modal {...args} size="small" />;
  },
  args: {
    visible: true,
    children: (
      <div style={{ padding: "24px", borderRadius: "4px", background: "#262626" }}>
        <h5 style={{ margin: 0, fontSize: "16px", lineHeight: "24px" }}>Title</h5>
        <p style={{ fontSize: "14px", lineHeight: "24px" }}>
          Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin
          literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin
          professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin
          words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in
          classical literature, discovered the undoubtable source.
        </p>
      </div>
    ),
  },
};

export const MediumSize: Story = {
  render: args => {
    return <Modal {...args} size="medium" />;
  },
  args: {
    visible: true,
    children: (
      <ModalPanel
        title="Title modal"
        actions={<Button size="normal" title="Okay" appearance="primary" />}>
        <div>
          Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin
          literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin
          professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin
          words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in
          classical literature, discovered the undoubtable source.
        </div>
      </ModalPanel>
    ),
  },
};

export const LargeSize: Story = {
  render: args => {
    return <Modal {...args} size="large" />;
  },
  args: {
    visible: true,
    children: (
      <ModalPanel
        title="Title modal"
        actions={
          <>
            <Button size="normal" title="Cancel" />
            <Button size="normal" title="Apply" appearance="primary" />
          </>
        }>
        <div>
          Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin
          literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin
          professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin
          words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in
          classical literature, discovered the undoubtable source.
        </div>
      </ModalPanel>
    ),
  },
};
