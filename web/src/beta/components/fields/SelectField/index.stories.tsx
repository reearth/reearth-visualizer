import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import SelectField, { Props } from ".";

const meta: Meta<typeof SelectField> = {
  component: SelectField,
};

export default meta;

type Story = StoryObj<typeof SelectField>;

export const Default: Story = (args: Props<string | number>) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: string) => updateArgs({ value: value }), [updateArgs]);

  return (
    <Wrapper>
      <div>
        <SelectField {...args} onChange={handleChange} />
      </div>
      <div>
        <SelectField
          {...args}
          name="Disabled"
          description="Props are controlled by the field above"
          disabled={true}
          onChange={handleChange}
        />
      </div>
      <div>
        <SelectField
          {...args}
          name="Empty"
          value={undefined}
          description="Even if you try, you won't be able to select the value"
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
  name: "Select Field",
  description: "Select from the options",
  disabled: false,
  value: undefined,
  options: [
    {
      value: "item 1 akas bakas moti kiran kapoor takhat buland biba kaur",
      key: "item_1",
    },
    { value: "item 2", key: "item_2" },
    { value: "item 3", key: "item_3" },
  ],
  onChange: () => console.log("clicked"),
};
