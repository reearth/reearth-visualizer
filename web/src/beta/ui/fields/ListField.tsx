import { useCallback, useEffect } from "react";

import DragAndDropList, {
  Props as DragAndDropProps,
} from "@reearth/beta/components/DragAndDropList";
import Text from "@reearth/beta/components/Text";
import { Button, ButtonProps, Icon } from "@reearth/beta/lib/reearth-ui";
// import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

type ListItem = {
  id: string;
  value: string;
};

export type ListFieldProps = CommonFieldProps &
  ButtonProps & {
    className?: string;
    description?: string;
    items: ListItem[];
    removeItem: (id: string) => void;
    addItem: () => void;
    onSelect: (id: string) => void;
    selected?: string;
    atLeastOneItem?: boolean;
  } & Pick<DragAndDropProps, "onItemDrop">;

const ListField: React.FC<ListFieldProps> = ({
  className,
  commonTitle,
  description,
  items,
  // removeItem,
  addItem,
  onItemDrop,
  onSelect,
  selected,
  atLeastOneItem,
}: ListFieldProps) => {
  // const t = useT();

  // const deleteItem = useCallback(() => {
  //   if (!selected) return;
  //   removeItem(selected);
  // }, [selected, removeItem]);

  const getId = useCallback(({ id }: ListItem) => {
    return id;
  }, []);

  // const disableRemoveButton = useMemo(() => {
  //   if (!selected || (atLeastOneItem && items.length === 1)) return true;

  //   return !items.find(({ id }) => id == selected);
  // }, [items, selected, atLeastOneItem]);

  // if atleastOneItem is true, make sure one item is always selected
  useEffect(() => {
    if (!atLeastOneItem) return;

    const updateSelected = !selected || !items.find(({ id }) => id === selected);
    if (updateSelected) {
      onSelect(items[0]?.id);
    }
  }, [selected, items, atLeastOneItem, onSelect]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <FieldContainer className={className}>
        <SectionButton
          onClick={addItem}
          icon="plus"
          appearance="secondary"
          title=" New Item"
          size="small"
          extendWidth={true}
        />
        <FieldWrapper>
          <DragAndDropList<ListItem>
            uniqueKey="ListField"
            items={items}
            onItemDrop={onItemDrop}
            getId={getId}
            renderItem={({ id, value }) => (
              <Item onClick={() => onSelect(id)} selected={selected === id}>
                <StyledText size="footnote">{value}</StyledText>
                <Icon icon="more" size={"small"} />
              </Item>
            )}
            gap={0}
          />
        </FieldWrapper>
      </FieldContainer>
    </CommonField>
  );
};

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.smallest}px;
`;

const FieldWrapper = styled.div`
  min-height: 84px;
  max-height: 224px;
  border-radius: 4px;
  border: 1px solid rgba(77, 83, 88, 1);
  overflow: auto;
`;

const Item = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  height: 28px;
  cursor: pointer;
  background: ${({ theme, selected }) => (selected ? theme.select.main : "inherit")};
  &:hover {
    background: ${({ theme, selected }) => (selected ? theme.select.main : theme.bg[2])};
  }
`;

const StyledText = styled(Text)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SectionButton = styled(Button)`
  height: 28px;
  width: 100%;
  padding: 0px;
  margin: 0px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default ListField;
