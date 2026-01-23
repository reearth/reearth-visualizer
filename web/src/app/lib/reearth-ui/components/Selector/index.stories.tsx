import { Meta, StoryObj } from "@storybook/react-vite";

import { Selector, SelectorProps } from ".";

const meta: Meta<SelectorProps> = {
  component: Selector
};

export default meta;
type Story = StoryObj<typeof Selector>;

const options = [
  {
    value: "item_1",
    label: "item_1"
  },
  {
    value: "item_2",
    label: "item_2"
  },
  {
    value: "item_3",
    label: "item_3"
  },
  {
    value: "item_4",
    label: "item_4"
  },
  {
    value: "item_5",
    label: "item_5"
  },
  {
    value: "item_6",
    label: "item_6"
  }
];

export const Default: Story = {
  render: () => {
    return <Selector options={options} />;
  }
};

export const MultipleSelector: Story = {
  render: () => {
    return <Selector options={options} multiple={true} />;
  }
};

export const NoOptions: Story = {
  render: () => {
    return <Selector options={[]} />;
  }
};

export const Disabled: Story = {
  render: () => {
    return (
      <div
        style={{
          width: "100%",
          gap: "8px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Selector options={options} disabled />
        <Selector options={options} value="item_1" disabled />
        <Selector
          options={options}
          value={["item_1", "item_2"]}
          multiple
          disabled
        />
      </div>
    );
  }
};
