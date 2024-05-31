import { Meta, StoryObj } from "@storybook/react";

import { Selector, SelectorProps } from ".";

const meta: Meta<SelectorProps> = {
  component: Selector,
};

export default meta;
type Story = StoryObj<typeof Selector>;

const LIST_ITEMS = [
  {
    value: "item_1",
    label: "item_1",
  },
  {
    value: "item_2",
    label: "item_2",
  },
  {
    value: "item_3",
    label: "item_3",
  },
  {
    value: "item_4",
    label: "item_4",
  },
  {
    value: "item_5",
    label: "item_5",
  },
  {
    value: "item_6",
    label: "item_6",
  },
];

export const Default: Story = {
  render: () => {
    return (
      <div style={{ width: "300px" }}>
        <Selector options={LIST_ITEMS} />
      </div>
    );
  },
};

export const MultipleSelector: Story = {
  render: () => {
    return (
      <div style={{ width: "300px" }}>
        <Selector options={LIST_ITEMS} multiple={true} />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    return (
      <div style={{ width: "300px" }}>
        <Selector options={LIST_ITEMS} disabled />
        <Selector options={LIST_ITEMS} value="item_1" disabled />
        <Selector options={LIST_ITEMS} value={["item_1", "item_2"]} multiple disabled />
      </div>
    );
  },
};
