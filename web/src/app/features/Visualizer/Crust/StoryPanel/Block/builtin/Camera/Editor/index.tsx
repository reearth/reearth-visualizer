import {
  CameraField,
  ColorField,
  InputField,
  ListField,
  NumberField
} from "@reearth/app/ui/fields";
import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { Camera } from "@reearth/core";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import useHooks, { type CameraBlock } from "./hooks";

export { type CameraBlock } from "./hooks";

export type Props = {
  items: CameraBlock[];
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
};

const CameraBlockEditor: FC<Props> = ({
  items,
  propertyId,
  selected,
  setSelected,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove
}) => {
  const t = useT();
  const {
    editorProperties,
    debounceOnUpdate,
    listItems,
    handleUpdate,
    handleFlyTo,
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
    onPropertyItemMove
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
        <CameraField
          title={editorProperties?.cameraPosition?.title}
          description={editorProperties?.cameraPosition?.description}
          value={editorProperties?.cameraPosition?.value as Camera}
          onSave={(value) =>
            handleUpdate(selected, "cameraPosition", "camera", value as Camera)
          }
          onFlyTo={handleFlyTo}
        />
        <NumberField
          title={editorProperties?.cameraDuration?.title}
          description={editorProperties?.cameraDuration?.description}
          value={editorProperties?.cameraDuration?.value}
          onChangeComplete={(value) =>
            handleUpdate(selected, "cameraDuration", "number", value || 0)
          }
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
  display: css.display.grid,
  gridTemplateColumns: "55% 42%",
  gridGap: "10px"
}));

const FieldGroup = styled("div")<{ disabled: boolean }>(
  ({ theme, disabled }) => ({
    display: css.display.flex,
    flexDirection: css.flexDirection.column,
    gap: theme.spacing.small,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "inherit",
    pointerEvents: disabled ? "none" : "inherit"
  })
);

export default CameraBlockEditor;
