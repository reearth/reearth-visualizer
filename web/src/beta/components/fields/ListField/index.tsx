import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Property from "@reearth/beta/components/fields";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export type Props = {
  name?: string;
  description?: string;
  items: string[];
  removeItem: (key: string) => void;
  addItem: () => void;
};

// TODO: where would the field rendering logic go??

const ListField: React.FC<Props> = ({ name, description, items, removeItem, addItem }: Props) => {
  const t = useT();
  const [selected, setSelected] = useState<string | null>(null);

  const deleteItem = useCallback(() => {
    if (!selected) return;
    removeItem(selected);
    setSelected(null);
  }, [selected, removeItem]);

  return (
    <Property name={name} description={description}>
      <FieldWrapper>
        {/* TODO: Make this drag and drop */}
        {items.map(item => (
          <Item onClick={() => setSelected(item)} key={item} selected={selected === item}>
            {item}
          </Item>
        ))}
      </FieldWrapper>
      <ButtonGroup>
        <ButtonWrapper
          onClick={deleteItem}
          icon="trash"
          buttonType="secondary"
          text={t("Remove")}
          size="medium"
          disabled={!selected}
        />
        <ButtonWrapper
          onClick={addItem}
          icon="plus"
          buttonType="secondary"
          text={t("Add Item")}
          size="medium"
        />
      </ButtonGroup>
    </Property>
  );
};

const FieldWrapper = styled.div`
  min-height: 84px;
  max-height: 224px;
  border-radius: 4px;
  border: 1px solid rgba(77, 83, 88, 1);
  overflow: auto;
`;

const Item = styled.p<{ selected: boolean }>`
  padding: 0 12px;
  height: 28px;
  font-size: 12px;
  cursor: pointer;
  background: ${({ theme, selected }) => (selected ? theme.select.main : "inherit")};
  &:hover {
    background: ${({ theme, selected }) => (selected ? theme.select.main : theme.bg[2])};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const ButtonWrapper = styled(Button)`
  height: 28px;
  width: 100%;
  padding: 0px;
  margin: 0px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default ListField;
