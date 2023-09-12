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

  const addItem = useCallback(
    () => updateArgs({ items: [...args.items, `Items ${args.items.length}`] }),
    [updateArgs, args.items],
  );

  const removeItem = useCallback(
    (key: string) => {
      updateArgs({ items: args.items.filter(item => item != key) });
    },
    [updateArgs, args.items],
  );

  return (
    <Wrapper>
      <div>
        <ListField {...args} addItem={addItem} removeItem={removeItem} />
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
  items: [],
};
