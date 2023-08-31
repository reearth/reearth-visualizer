import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import ToggleField, { Props } from ".";

const meta: Meta<typeof ToggleField> = {
  component: ToggleField,
};

export default meta;

type Story = StoryObj<typeof ToggleField>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback(
    (checked: boolean) => updateArgs({ checked: !checked }),
    [updateArgs],
  );

  return (
    <Wrapper>
      <div>
        <ToggleField {...args} onChange={handleChange} />
      </div>
      <div>
        <ToggleField
          {...args}
          name="Reverse Toggle"
          description={"Invesere of above"}
          checked={!args.checked}
          onChange={handleChange}
        />
      </div>
      <div>
        <ToggleField
          {...args}
          name="Disabled"
          description="Disabled field"
          disabled={true}
          onChange={handleChange}
        />
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
  name: "Toggle Field",
  description: "Sample description",
  checked: true,
  disabled: false,
  onChange: () => console.log("clicked"),
};
