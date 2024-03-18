import { useCallback } from "react";

import Button from "@reearth/beta/components/Button";
import SelectField from "@reearth/beta/components/fields/SelectField";
import TextField from "@reearth/beta/components/fields/TextField";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export type DisplayTypeField = {
  type?: "string";
  title?: string;
  value?: string;
  choices?: { key: string; title: string }[];
};

export type PropertyListItem = { key: string; value: string };

export type PropertyListField = {
  type?: "array";
  title?: string;
  value: PropertyListItem[];
};

type Props = {
  propertyId?: string;
  displayTypeField?: DisplayTypeField;
  propertyListField?: PropertyListField;
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

const ListEditor: React.FC<Props> = ({
  propertyId,
  displayTypeField,
  propertyListField,
  onPropertyUpdate,
}) => {
  const t = useT();

  // const [propertyList, setPropertyList] = useState(property?.propertyList?.value);

  // useEffect(()=>{
  //   if(displayTypeField?.value === "custom" && !propertyList){
  //     setPropertyList(property?.propertyList?.value)
  //   }
  // }, [displayTypeField?.value, property?.propertyList?.value, propertyList])

  const handlePropertyValueUpdate = useCallback(
    (schemaGroupId?: string, propertyId?: string, fieldId?: string, vt?: any, itemId?: string) => {
      return async (v?: any) => {
        if (!schemaGroupId || !propertyId || !fieldId || !vt) return;
        await onPropertyUpdate?.(propertyId, schemaGroupId, fieldId, itemId, vt, v);
      };
    },
    [onPropertyUpdate],
  );

  const handlePropertyValueRemove = useCallback(
    async (idx: number) => {
      if (propertyListField) {
        const newValue = propertyListField.value.filter((_, i) => i !== idx);
        await handlePropertyValueUpdate(
          "default",
          propertyId,
          "propertyList",
          propertyListField.type,
        )(newValue);
      }
    },
    [propertyId, propertyListField, handlePropertyValueUpdate],
  );

  return (
    <Wrapper>
      <SelectField
        name={displayTypeField?.title}
        value={displayTypeField?.value}
        options={displayTypeField?.choices?.map(
          ({ key, title }: { key: string; title: string }) => ({
            key,
            label: title,
          }),
        )}
        onChange={handlePropertyValueUpdate(
          "default",
          propertyId,
          "displayType",
          displayTypeField?.type,
        )}
      />
      {propertyListField && (
        <>
          <Text size="footnote">{propertyListField.title}</Text>
          <FieldWrapper>
            {propertyListField?.value?.map((p, idx) => (
              <Field key={idx}>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <HandleIcon icon="dndHandle" />
                  <StyledTextField value={p.key} />
                </div>
                {/* <StyledText size="body">{p.title}</StyledText> */}
                <StyledTextField value={p.value} />
                <StyledIcon icon="trash" onClick={() => handlePropertyValueRemove(idx)} />
              </Field>
            ))}
          </FieldWrapper>
          <StyledButton
            icon="plus"
            size="small"
            onClick={() =>
              handlePropertyValueUpdate(
                "default",
                propertyId,
                "propertyList",
                propertyListField.type,
              )([
                ...(propertyListField.value || []),
                {
                  key: `Field ${propertyListField.value.length + 1 || 1}`,
                  value: `Value ${propertyListField.value.length + 1 || 1}`,
                },
              ])
            }>
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
  box-sizing: border-box;
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

// const StyledText = styled(Text)`
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   flex: 1;
// `;

const StyledTextField = styled(TextField)`
  width: 100px;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;

const StyledButton = styled(Button)`
  //   box-sizing: border-box;
  width: 114px;
`;
