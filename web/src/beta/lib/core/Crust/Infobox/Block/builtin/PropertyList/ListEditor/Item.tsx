import TextField from "@reearth/beta/components/fields/TextField";
import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

import { PropertyListItem } from ".";

type Props = {
  item: PropertyListItem;
  onChangeKey: (newValue?: string) => void;
  onChangeValue: (newValue?: string) => void;
  onItemRemove: () => void;
};

const EditorItem: React.FC<Props> = ({ item, onChangeKey, onChangeValue, onItemRemove }) => (
  <Field>
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <HandleIcon icon="dndHandle" />
      <StyledTextField value={item.key} onChange={onChangeKey} />
    </div>
    <StyledTextField value={item.value} onChange={onChangeValue} />
    <StyledIcon icon="trash" onClick={onItemRemove} />
  </Field>
);

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
