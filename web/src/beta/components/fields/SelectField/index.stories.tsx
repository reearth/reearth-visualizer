import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import SelectField, { SingleSelectProps, MultiSelectProps } from ".";

const meta: Meta<typeof SelectField> = {
  component: SelectField,
};

export default meta;

type Story = StoryObj<typeof SelectField>;

export const Default: Story = (args: SingleSelectProps) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback(
    (value: string) => {
      updateArgs({ value: value });
    },
    [updateArgs],
  );

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
          name="Multi Select"
          description="You can select multiple options"
          onChange={handleChange}
        />
      </div>
    </Wrapper>
  );
};

export const MultiSelect: Story = (args: MultiSelectProps) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback(
    (value: string[] | undefined) => {
      updateArgs({ value: value });
    },
    [updateArgs],
  );

  return (
    <Wrapper>
      <div>
        <SelectField
          {...args}
          name="Multi Select"
          description="You can select multiple options"
          onChange={handleChange}
          multiSelect
        />
      </div>
      <div>
        <SelectField
          {...args}
          name="Disabled"
          description="Props are controlled by the field above"
          disabled={true}
          onChange={handleChange}
          multiSelect
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
  margin-right: 2rem;
  margin-top: 2rem;
  height: 300px;
`;

Default.args = {
  name: "Select Field",
  description: "Select from the options ",
  disabled: false,
  value: undefined,
  options: [
    {
      label: "item 1 akas bakas moti kiran kapoor takhat buland biba kaur",
      key: "item_1",
    },
    { label: "item 2", key: "item_2" },
    { label: "item 3", key: "item_3" },
  ],
  onChange: () => console.log("clicked"),
};

MultiSelect.args = {
  name: "Select Field",
  description: "Select from the options ",
  disabled: false,
  value: undefined,
  options: [
    {
      label: "item 1",
      key: "item_1",
    },
    { label: "item 2", key: "item_2" },
    { label: "item 3", key: "item_3" },
    { label: "item 4", key: "item_4" },
    { label: "item 5", key: "item_5" },
    { label: "item 6", key: "item_6" },
    { label: "item 7", key: "item_7" },
  ],
  multiSelect: true,
  onChange: () => console.log("clicked"),
};
