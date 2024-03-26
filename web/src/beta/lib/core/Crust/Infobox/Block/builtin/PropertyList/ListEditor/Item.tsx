import { useCallback, useState } from "react";

import TextField from "@reearth/beta/components/fields/TextField";
import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

import { PropertyListItem } from ".";

type Props = {
  item: PropertyListItem;
  onKeyChange: (newValue?: string) => void;
  onValueChange: (newValue?: string) => void;
  onItemRemove: () => void;
};

const EditorItem: React.FC<Props> = ({ item, onKeyChange, onValueChange, onItemRemove }) => {
  const [currentKeyValue, setCurrentKeyValue] = useState<string>(item.key);
  const [currentValue, setCurrentValue] = useState<string>(item.value);

  const handleKeyChange = useCallback(
    (newValue: string) => {
      setCurrentKeyValue(newValue);
      onKeyChange(newValue);
    },
    [onKeyChange],
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      setCurrentValue(newValue);
      onValueChange(newValue);
    },
    [onValueChange],
  );

  return (
    <Field>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <HandleIcon icon="dndHandle" />
        <StyledTextField value={currentKeyValue} onChange={handleKeyChange} />
      </div>
      <StyledTextField value={currentValue} onChange={handleValueChange} />
      <StyledIcon icon="trash" onClick={onItemRemove} />
    </Field>
  );
};

export default EditorItem;

const Field = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  width: 100%;
  background: ${({ theme }) => theme.bg[2]};
  color: ${({ theme }) => theme.content.main};
  padding: 8px 4px;
  border-radius: 4px;
  box-sizing: border-box;
`;

const HandleIcon = styled(Icon)`
  color: ${({ theme }) => theme.content.weak};
  cursor: move;

  &:hover {
    color: ${({ theme }) => theme.content.main};
  }
`;

const StyledTextField = styled(TextField)`
  width: 110px;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;
