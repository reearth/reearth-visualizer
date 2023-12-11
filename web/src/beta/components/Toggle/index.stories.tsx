import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import Toggle, { Props } from ".";

const meta: Meta<typeof Toggle> = {
  component: Toggle,
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback(
    (checked: boolean) => updateArgs({ checked: !checked }),
    [updateArgs],
  );

  return (
    <Wrapper>
      <div>
        <Toggle {...args} onChange={handleChange} />
      </div>
      <div>
        <Toggle {...args} checked={!args.checked} onChange={handleChange} />
      </div>
      <div>
        <Toggle {...args} checked={!args.checked} disabled={true} onChange={handleChange} />
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
  checked: true,
  disabled: false,
  onChange: () => console.log("clicked"),
};
