import { Meta, StoryObj } from "@storybook/react";

import { Selector, SelectorProps } from ".";

const meta: Meta<SelectorProps> = {
  component: Selector,
};

export default meta;
type Story = StoryObj<typeof Selector>;

const LIST_ITEMS = ["item_1", "item_2", "item_3", "item_4", "item_5", "item_6"];

export const Default: Story = {
  render: () => {
    return (
      <div style={{ width: "300px" }}>
        <Selector values={LIST_ITEMS} />
      </div>
    );
  },
};

export const MultipleSelector: Story = {
  render: () => {
    return (
      <div style={{ width: "300px" }}>
        <Selector values={LIST_ITEMS} isMultiple />
      </div>
    );
  },
};
