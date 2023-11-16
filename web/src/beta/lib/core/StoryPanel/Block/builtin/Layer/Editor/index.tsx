import ColorField from "@reearth/beta/components/fields/ColorField";
import ListField from "@reearth/beta/components/fields/ListField";
import SelectField from "@reearth/beta/components/fields/SelectField";
import TextField from "@reearth/beta/components/fields/TextField";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks, { type LayerBlock } from "./hooks";

export { type LayerBlock } from "./hooks";

export type Props = {
  items: LayerBlock[];
  selected: string;
  propertyId?: string;
  setSelected: (id: string) => void;
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

const CameraBlockEditor: React.FC<Props> = ({
  items,
  propertyId,
  selected,
  setSelected,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove,
}) => {
  const t = useT();
  const {
    layers,
    editorProperties,
    debounceOnUpdate,
    listItems,
    handleItemAdd,
    handleItemRemove,
    handleItemMove,
  } = useHooks({
    selected,
    items,
    propertyId,
    onPropertyUpdate,
    onPropertyItemAdd,
    onPropertyItemDelete,
    onPropertyItemMove,
  });

  return (
    <EditorWrapper>
      <GroupWrapper>
        <ListField
          name={t("Buttons List")}
          items={listItems}
          addItem={handleItemAdd}
          removeItem={handleItemRemove}
          onItemDrop={handleItemMove}
          selected={selected}
          onSelect={setSelected}
          atLeastOneItem
        />
        <FieldGroup disabled={!editorProperties}>
          <TextField
            name={editorProperties?.title?.title}
            description={editorProperties?.title?.description}
            value={editorProperties?.title?.value}
            onChange={value => debounceOnUpdate(selected, "title", "string", value)}
          />
          <ColorField
            name={editorProperties?.color?.title}
            description={editorProperties?.color?.description}
            value={editorProperties?.color?.value}
            onChange={value => debounceOnUpdate(selected, "color", "string", value)}
          />
          <ColorField
            name={editorProperties?.bgColor?.title}
            description={editorProperties?.bgColor?.description}
            value={editorProperties?.bgColor?.value}
            onChange={value => debounceOnUpdate(selected, "bgColor", "string", value)}
          />
        </FieldGroup>
      </GroupWrapper>

      <FieldGroup disabled={!editorProperties}>
        <SelectField
          name={editorProperties?.showLayers?.title}
          description={editorProperties?.showLayers?.description}
          options={layers}
          value={editorProperties?.showLayers?.value}
          onChange={value => debounceOnUpdate(selected, "showLayers", "array", value)}
          multiSelect
        />
      </FieldGroup>
    </EditorWrapper>
  );
};

const EditorWrapper = styled.div`
  padding: 12px;
  margin: 2px 0;
  background: ${({ theme }) => theme.bg[1]};
`;

const GroupWrapper = styled.div`
  display: grid;
  grid-template-columns: 55% 42%;
  grid-gap: 10px;
`;

const FieldGroup = styled.div<{ disabled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "inherit")};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "inherit")};
`;

export default CameraBlockEditor;
