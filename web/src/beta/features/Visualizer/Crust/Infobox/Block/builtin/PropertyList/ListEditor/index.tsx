import Button from "@reearth/beta/components/Button";
import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import SelectField from "@reearth/beta/components/fields/SelectField";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks, { ListItem } from "./hooks";
import EditorItem from "./Item";

export type DisplayTypeField = {
  type?: "string";
  title?: string;
  value?: string;
  choices?: { key: string; title: string }[];
};

export type PropertyListItem = { id: string; key: string; value: string };

export type PropertyListField = {
  type?: "array";
  title?: string;
  value?: PropertyListItem[];
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

  const {
    displayOptions,
    currentPropertyList,
    handleKeyChange,
    handleValueChange,
    handleDisplayTypeUpdate,
    handleItemAdd,
    handleItemDrop,
    handlePropertyValueRemove,
  } = useHooks({ propertyId, propertyListField, displayTypeField, onPropertyUpdate });

  return (
    <Wrapper>
      <SelectField
        name={displayTypeField?.title}
        value={displayTypeField?.value}
        options={displayOptions}
        onChange={handleDisplayTypeUpdate}
      />
      {propertyListField && currentPropertyList && currentPropertyList.length > 0 && (
        <>
          <Text size="footnote">{propertyListField.title}</Text>
          <FieldWrapper>
            <DragAndDropList<ListItem>
              uniqueKey="property-block"
              gap={5}
              items={currentPropertyList}
              getId={item => item.id}
              onItemDrop={handleItemDrop}
              renderItem={(item, idx) => {
                if (!currentPropertyList) return null;
                return (
                  <EditorItem
                    key={item.id}
                    item={item}
                    onKeyChange={handleKeyChange(idx)}
                    onValueChange={handleValueChange(idx)}
                    onItemRemove={() => handlePropertyValueRemove(idx)}
                  />
                );
              }}
            />
          </FieldWrapper>
        </>
      )}
      {displayTypeField?.value === "custom" && (
        <StyledButton icon="plus" size="small" onClick={handleItemAdd}>
          {t("New Field")}
        </StyledButton>
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
  box-sizing: border-box;
`;

const StyledButton = styled(Button)`
  box-sizing: border-box;
`;
