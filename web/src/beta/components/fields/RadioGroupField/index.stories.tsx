import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import RadioGroupField from "./index";

type Props = React.ComponentProps<typeof RadioGroupField>;

const meta: Meta<typeof RadioGroupField> = {
  component: RadioGroupField,
};

export default meta;

type Story = StoryObj<typeof RadioGroupField>;

const options = [
  { key: "option1", value: "Option 1", selected: false },
  { key: "option2", value: "Option 2", selected: false },
];

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: string) => updateArgs({ value }), [updateArgs]);

  return (
    <Wrapper>
      <RadioGroupField {...args} onChange={handleChange} />
    </Wrapper>
  );
};
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10%;
  margin-left: 2rem;
  margin-top: 2rem;
  height: 134px;
  width: 289px;
`;

Default.args = {
  value: options,
  onChange: () => console.log("clicked"),
  name: "Radio group field",
  description: "Radio group field",
};
