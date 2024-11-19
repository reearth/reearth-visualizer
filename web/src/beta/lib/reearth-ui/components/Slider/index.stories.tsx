import { styled } from "@reearth/services/theme";
import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { Slider, SliderProps } from ".";

const meta: Meta<typeof Slider> = {
  component: Slider
};

type Story = StoryObj<typeof Slider>;

export default meta;

export const Default: Story = (args: SliderProps) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback(
    (value: number) => updateArgs({ value: value }),
    [updateArgs]
  );

  return (
    <Wrapper>
      <div>
        <Slider {...args} onChange={handleChange} />
      </div>
    </Wrapper>
  );
};

export const Disabled: Story = (args: SliderProps) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback(
    (value: number) => updateArgs({ value: value }),
    [updateArgs]
  );

  return (
    <Wrapper>
      {[10, 25].map((value, index) => (
        <div key={index}>
          <Slider
            {...args}
            value={value}
            disabled={true}
            onChange={handleChange}
          />
        </div>
      ))}
    </Wrapper>
  );
};

Default.args = {
  value: 0.5,
  min: 0,
  max: 1,
  step: 0.1,
  disabled: false
};

Disabled.args = {
  value: 50,
  min: 0,
  max: 100,
  step: 10,
  disabled: true
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10%;
  margin: 2rem;
  height: 300px;
`;
