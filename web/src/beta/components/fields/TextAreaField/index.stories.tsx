import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import TextAreaField, { Props } from ".";

const meta: Meta<typeof TextAreaField> = {
  component: TextAreaField,
};

export default meta;

type Story = StoryObj<typeof TextAreaField>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: string) => updateArgs({ value: value }), [updateArgs]);

  return (
    <Wrapper>
      <div>
        <TextAreaField {...args} onChange={handleChange} />
      </div>
      <div>
        <TextAreaField
          {...args}
          onChange={handleChange}
          description="set with minHeight"
          minHeight={115}
        />
      </div>
      <div>
        <TextAreaField
          {...args}
          onChange={handleChange}
          description="set with minHeight"
          disabled={true}
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
  name: "Text Area Field",
  description: "Description around",
  disabled: false,
  value: undefined,
  onChange: () => console.log("clicked"),
};
