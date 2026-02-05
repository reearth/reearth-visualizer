import {
  ColorField,
  InputField,
  ListField,
  SelectField
} from "@reearth/app/ui/fields";
import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import type { NLSLayer } from "@reearth/services/api/layer";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

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
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
  nlsLayers?: NLSLayer[];
};

const CameraBlockEditor: FC<Props> = ({
  items,
  propertyId,
  selected,
  setSelected,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove,
  nlsLayers
}) => {
  const t = useT();
  const {
    layers,
    editorProperties,
    debounceOnUpdate,
    listItems,
    handleItemAdd,
    handleItemRemove,
    handleItemMove
  } = useHooks({
    selected,
    items,
    propertyId,
    onPropertyUpdate,
    onPropertyItemAdd,
    onPropertyItemDelete,
    onPropertyItemMove,
    nlsLayers
  });

  return (
    <EditorWrapper>
      <GroupWrapper>
        <ListField
          title={t("Buttons List")}
          items={listItems}
          selected={selected}
          onItemAdd={handleItemAdd}
          onItemDelete={handleItemRemove}
          onItemMove={handleItemMove}
          onItemSelect={setSelected}
          isEditable={false}
          atLeastOneItem
        />
        <FieldGroup disabled={!editorProperties}>
          <InputField
            title={editorProperties?.title?.title}
            description={editorProperties?.title?.description}
            value={editorProperties?.title?.value}
            onChangeComplete={(value) =>
              debounceOnUpdate(selected, "title", "string", value)
            }
          />
          <ColorField
            title={editorProperties?.color?.title}
            description={editorProperties?.color?.description}
            value={editorProperties?.color?.value}
            onChange={(value) =>
              debounceOnUpdate(selected, "color", "string", value)
            }
          />
          <ColorField
            title={editorProperties?.bgColor?.title}
            description={editorProperties?.bgColor?.description}
            value={editorProperties?.bgColor?.value}
            onChange={(value) =>
              debounceOnUpdate(selected, "bgColor", "string", value)
            }
          />
        </FieldGroup>
      </GroupWrapper>

      <FieldGroup disabled={!editorProperties}>
        <SelectField
          title={editorProperties?.showLayers?.title}
          description={editorProperties?.showLayers?.description}
          options={layers}
          value={editorProperties?.showLayers?.value}
          onChange={(value) =>
            debounceOnUpdate(selected, "showLayers", "array", value)
          }
          maxHeight={300}
          multiple
        />
      </FieldGroup>
    </EditorWrapper>
  );
};

const EditorWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  margin: `${theme.spacing.micro}px 0`,
  background: theme.bg[1]
}));

const GroupWrapper = styled("div")(() => ({
  display: "grid",
  gridTemplateColumns: "55% 42%",
  gridGap: "10px"
}));

const FieldGroup = styled("div")<{ disabled: boolean }>(
  ({ theme, disabled }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.small,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "inherit",
    pointerEvents: disabled ? "none" : "inherit"
  })
);
export default CameraBlockEditor;
