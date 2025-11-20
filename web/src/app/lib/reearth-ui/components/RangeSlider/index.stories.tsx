import { Meta, StoryObj } from "@storybook/react-vite";

import { RangeSlider, RangeSliderProps } from ".";

const meta: Meta<RangeSliderProps> = {
  component: RangeSlider
};

export default meta;

type Story = StoryObj<RangeSliderProps>;

export const Default: Story = {
  render: () => (
    <div
      style={{
        minHeight: "40px",
        padding: "12px"
      }}
    >
      <RangeSlider
        value={[0, 50]}
        min={0}
        max={100}
        step={1}
        disabled={false}
      />
    </div>
  )
};

export const Disabled: Story = {
  render: () => (
    <div
      style={{
        padding: "12px"
      }}
    >
      <RangeSlider
        value={[2, 50]}
        min={0}
        max={100}
        step={10}
        disabled={true}
      />
    </div>
  )
};
