import { Meta, StoryObj } from "@storybook/react";

import Button from "../Button";
import Text from "../Text";

import Modal from ".";

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: "classic/atoms/Modal",
};

export default meta;

type Story = StoryObj<typeof Modal>;

const ModalContent: React.FC = () => {
  return (
    <Text size="m">
      Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of
      classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a
      Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin
      words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in
      classical literature, discovered the undoubtable source.
    </Text>
  );
};

export const Small: Story = {
  render: () => (
    <Modal size="sm" isVisible={true} title="Small modal" button1={<Button text="Confirm" />}>
      <ModalContent />
    </Modal>
  ),
};

export const Medium: Story = {
  render: () => (
    <Modal size="md" isVisible={true} title="Medium modal" button1={<Button text="Confirm" />}>
      <ModalContent />
    </Modal>
  ),
};

export const Large: Story = {
  render: () => (
    <Modal size="lg" isVisible={true} title="Large modal" button1={<Button text="Confirm" />}>
      <ModalContent />
    </Modal>
  ),
};
