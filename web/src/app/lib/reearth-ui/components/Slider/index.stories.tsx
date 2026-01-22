import { styled } from "@reearth/services/theme";
import { Meta, StoryObj } from "@storybook/react-vite";

import { Slider, SliderProps } from ".";

const meta: Meta<typeof Slider> = {
  component: Slider
};

type Story = StoryObj<typeof Slider>;

export default meta;

export const Default: Story = (args: SliderProps) => {
  return (
    <Wrapper>
      <div>
        <Slider {...args} />
      </div>
    </Wrapper>
  );
};

export const Disabled: Story = (args: SliderProps) => {
  return (
    <Wrapper>
      {[10, 25].map((value, index) => (
        <div key={index}>
          <Slider {...args} value={value} disabled={true} />
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
  padding: 20px 0;
  gap: 40px;
  margin: 2rem;
`;
