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

  const addItem = useCallback(() => {
    const randomId = (Math.random() + 1).toString(36).substring(7);
    updateArgs({
      items: [
        ...args.items,
        {
          id: randomId,
          value: `Item ${randomId}`,
        },
      ],
    });
  }, [updateArgs, args.items]);

  const removeItem = useCallback(
    (key: string) => {
      updateArgs({ items: args.items.filter(({ id }) => id != key) });
    },
    [updateArgs, args.items],
  );

  const onItemDrop = useCallback(
    (item: { id: string; value: string }, index: number) => {
      const items = [...args.items];
      items.splice(
        items.findIndex(x => x.id === item.id),
        1,
      );
      items.splice(index, 0, item);
      updateArgs({ items });
    },
    [updateArgs, args.items],
  );

  const onSelect = useCallback((id: string) => updateArgs({ selected: id }), [updateArgs]);

  return (
    <Wrapper>
      <div>
        <ListField
          {...args}
          addItem={addItem}
          removeItem={removeItem}
          onItemDrop={onItemDrop}
          onSelect={onSelect}
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
  width: 300px;
`;

Default.args = {
  name: "List Field",
  description: "List field Sample description",
  items: [
    {
      id: "w3tlwi",
      value: "Item w3tlwi",
    },
    {
      id: "77eg5",
      value: "Item 77eg5",
    },
    {
      id: "7p218",
      value: "Item 7p218",
    },
    {
      id: "xquyo",
      value: "Item xquyo",
    },
    {
      id: "2mewj",
      value: "Item 2mewj",
    },
    {
      id: "d2gmu",
      value: "Item d2gmu",
    },
  ],
};
