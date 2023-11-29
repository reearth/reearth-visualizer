import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import RangeSlider, { Props } from ".";

const meta: Meta<typeof RangeSlider> = {
  component: RangeSlider,
};

type Story = StoryObj<typeof RangeSlider>;

export default meta;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: number[]) => updateArgs({ value: value }), [updateArgs]);

  return (
    <Wrapper>
      <div>
        <RangeSlider {...args} onChange={handleChange} />
      </div>
      <div>
        <RangeSlider {...args} max={args.max ? 2 * args.max : undefined} onChange={handleChange} />
      </div>
      <div>
        <RangeSlider {...args} disabled={true} onChange={handleChange} />
      </div>
    </Wrapper>
  );
};

Default.args = {
  value: [2, 50],
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10%;
  margin: 2rem;
  height: 300px;
`;
