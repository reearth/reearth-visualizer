import React, { forwardRef } from "react";

import Text from "@reearth/components/atoms/Text";
import { DropType, ItemProps } from "@reearth/components/atoms/TreeView";
import { styled, useTheme } from "@reearth/theme";

export type Item = {
  id: string;
  title?: string;
};

export type Props = ItemProps<Item> & {
  className?: string;
};

const PropertyListItem: React.ForwardRefRenderFunction<HTMLDivElement, Props> = (
  { className, item, selected, index, onSelect, dropType, canDrop },
  ref,
) => {
  const theme = useTheme();
  return (
    <Wrapper
      ref={ref}
      className={className}
      dropType={canDrop ? dropType : undefined}
      onClick={onSelect}
      selected={selected}>
      <Text size="xs" color={theme.main.strongText} otherProperties={{ marginRight: "10px" }}>
        {index[index.length - 1] + 1}
      </Text>
      <Text size="xs" color={theme.main.strongText} otherProperties={{ flex: 1 }}>
        {item.content.title}
      </Text>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ dropType?: DropType; selected?: boolean }>`
  display: flex;
  padding: 10px;
  background: ${({ selected, theme }) => (selected ? theme.main.select : "transparent")};
  color: ${({ selected, theme }) =>
    selected ? theme.properties.titleText : theme.properties.contentsText};
  align-items: center;
  cursor: pointer;
  user-select: none;
  border: 2px solid transparent;
  border-top-color: ${({ dropType, selected, theme }) =>
    dropType === "top" ? theme.main.danger : selected ? theme.layers.selectedLayer : "transparent"};
  border-bottom-color: ${({ dropType, selected, theme }) =>
    dropType === "bottom" ? theme.main.alert : selected ? theme.main.select : "transparent"};
  &:hover {
    background: ${({ selected, theme }) => (selected ? null : theme.main.paleBg)};
  }
`;

export default forwardRef(PropertyListItem);
