import {
  Button,
  DragAndDropList,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { SelectField } from "@reearth/app/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import useHooks from "./hooks";
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
    v?: any
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

const CURRENT_PROPERTY_LIST_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-custom-properties-drag-handle";

const ListEditor: FC<Props> = ({
  propertyId,
  displayTypeField,
  propertyListField,
  onPropertyUpdate
}) => {
  const t = useT();

  const {
    displayOptions,
    currentPropertyList,
    editValueIndex,
    editKeyIndex,
    handleKeyBlur,
    handleValueBlur,
    handleDisplayTypeUpdate,
    handleItemAdd,
    handleMoveStart,
    handleMoveEnd,
    handlePropertyValueRemove,
    handleDoubleClick,
    handlePropertyListUpdate
  } = useHooks({
    propertyId,
    propertyListField,
    displayTypeField,
    onPropertyUpdate
  });

  const DraggableCurrentPropertyList = useMemo(
    () =>
      currentPropertyList?.map((item, idx) => ({
        id: item.id,
        content: (
          <EditorItem
            key={item.id}
            item={item}
            isEditKey={editKeyIndex === idx}
            isEditValue={editValueIndex === idx}
            onKeyBlur={handleKeyBlur(idx)}
            handleClassName={CURRENT_PROPERTY_LIST_DRAG_HANDLE_CLASS_NAME}
            onValueBlur={handleValueBlur(idx)}
            onDoubleClick={(field: string) => handleDoubleClick(idx, field)}
            onItemRemove={() => handlePropertyValueRemove(idx)}
          />
        )
      })),
    [
      currentPropertyList,
      editKeyIndex,
      editValueIndex,
      handleKeyBlur,
      handleValueBlur,
      handleDoubleClick,
      handlePropertyValueRemove
    ]
  );

  return (
    <Wrapper>
      <SelectField
        title={displayTypeField?.title}
        value={displayTypeField?.value}
        options={displayOptions || []}
        onChange={handleDisplayTypeUpdate}
      />
      {propertyListField &&
        currentPropertyList &&
        currentPropertyList.length > 0 && (
          <>
            <Typography size="body">{propertyListField.title}</Typography>
            <FieldWrapper>
              <DragAndDropList
                items={DraggableCurrentPropertyList}
                onMoveStart={handleMoveStart}
                onMoveEnd={handleMoveEnd}
                handleClassName={CURRENT_PROPERTY_LIST_DRAG_HANDLE_CLASS_NAME}
              />
            </FieldWrapper>
          </>
        )}
      {displayTypeField?.value === "custom" && (
        <ActionsWrapper>
          <Button
            title={t("New Field")}
            icon="plus"
            size="small"
            onClick={handleItemAdd}
            extendWidth
          />
          <Button
            title={t("Save")}
            icon="floppyDisk"
            size="small"
            onClick={() => handlePropertyListUpdate(currentPropertyList)}
            extendWidth
          />
        </ActionsWrapper>
      )}
    </Wrapper>
  );
};

export default ListEditor;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  background: theme.bg[1],
  gap: theme.spacing.small,
  padding: theme.spacing.normal
}));

const FieldWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: theme.spacing.smallest,
  boxSizing: "border-box"
}));

const ActionsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
  boxSizing: "border-box"
}));
