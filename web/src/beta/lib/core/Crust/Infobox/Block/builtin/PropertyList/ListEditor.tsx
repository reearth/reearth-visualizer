import { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import SelectField from "@reearth/beta/components/fields/SelectField";
import TextField from "@reearth/beta/components/fields/TextField";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Property = {
  displayType?: {
    title?: string;
    value?: string;
    choices?: { key: string; label: string }[];
  };
  propertyList?: {
    title?: string;
    value: { key: string; title: string; field: string }[];
  };
};

type Props = {
  propertyId?: string;
  property?: Property;
  isEditable?: boolean;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
  ) => Promise<void>;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

const ListEditor: React.FC<Props> = ({ propertyId, property }) => {
  const t = useT();
  //   console.log("PID", propertyId, property);
  const selectField = useMemo(() => property?.displayType, [property?.displayType]);

  const propertyList = useMemo(
    () => (selectField?.value === "custom" ? property?.propertyList : undefined),
    [property?.propertyList, selectField?.value],
  );

  return (
    <Wrapper>
      <SelectField
        name={selectField?.title}
        value={selectField?.value}
        options={selectField?.choices}
        onChange={() => console.log("TRYING TO CHANGE", propertyId)}
      />
      {propertyList && (
        <>
          <Text size="footnote">{propertyList.title}</Text>
          <FieldWrapper>
            {propertyList?.value?.map(p => (
              <Field key={p.key}>
                <HandleIcon icon="dndHandle" />
                <StyledText size="body">{p.title}</StyledText>
                <StyledTextField value={p.field} />
                <Icon icon="trash" onClick={() => console.log("Remove field")} />
              </Field>
            ))}
          </FieldWrapper>
          <StyledButton
            icon="plus"
            size="small"
            onClick={() => console.log("Add new field", propertyId)}>
            {t("New Field")}
          </StyledButton>
        </>
      )}
    </Wrapper>
  );
};

export default ListEditor;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${({ theme }) => theme.bg[1]};
  padding: 12px;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  align-items: center;
  width: 100%;
`;

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

const StyledText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const StyledTextField = styled(TextField)`
  width: 113px;
`;

const StyledButton = styled(Button)`
  //   box-sizing: border-box;
  width: 114px;
`;
