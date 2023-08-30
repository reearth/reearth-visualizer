import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { styled } from "@reearth/services/theme";

import Property from "..";

import Toggle from ".";

type Props = React.ComponentProps<typeof Toggle>;

const meta: Meta<typeof Toggle> = {
  component: Toggle,
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (checked: boolean) => updateArgs({ checked: !checked });

  return (
    <Wrapper>
      <div>
        <Toggle {...args} onChange={handleChange} />
      </div>
      <div>
        <Property name="Switch Toggle">
          <Toggle {...args} onChange={handleChange} />
        </Property>
      </div>

      <div>
        <Property name="Switch Toggle" description="Switch toggle description">
          <Toggle {...args} onChange={handleChange} />
        </Property>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10%;
  margin-left: 2rem;
  margin-top: 2rem;
  height: 300px;
`;

Default.args = {
  checked: false,
  disabled: false,
  onChange: () => console.log("clicked"),
};
