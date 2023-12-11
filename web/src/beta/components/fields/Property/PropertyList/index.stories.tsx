import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import ListField, { Props } from ".";

const meta: Meta<typeof ListField> = {
  component: ListField,
};

export default meta;

type Story = StoryObj<typeof ListField>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const onSelect = useCallback((id: string) => updateArgs({ selected: id }), [updateArgs]);

  return (
    <Wrapper>
      <div>
        <ListField {...args} onSelect={onSelect} />
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
  width: 300px;
`;

Default.args = {
  name: "List Field",
  description: "List field Sample description",
  items: [
    {
      id: "w3tlwi",
      title: "Item w3tlwi",
    },
    {
      id: "77eg5",
      title: "Item 77eg5",
    },
    {
      id: "7p218",
      title: "Item 7p218",
    },
    {
      id: "xquyo",
      title: "Item xquyo",
    },
    {
      id: "2mewj",
      title: "Item 2mewj",
    },
    {
      id: "d2gmu",
      title: "Item d2gmu",
    },
  ],
};
