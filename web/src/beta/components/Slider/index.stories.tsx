import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import Slider, { Props } from ".";

const meta: Meta<typeof Slider> = {
  component: Slider,
};

type Story = StoryObj<typeof Slider>;

export default meta;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: number) => updateArgs({ value: value }), [updateArgs]);

  return (
    <Wrapper>
      <div>
        <Slider {...args} onChange={handleChange} />
      </div>
      <div>
        <Slider {...args} max={args.max ? 2 * args.max : undefined} onChange={handleChange} />
      </div>
      <div>
        <Slider {...args} disabled={true} onChange={handleChange} />
      </div>
    </Wrapper>
  );
};

Default.args = {
  value: 50,
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
