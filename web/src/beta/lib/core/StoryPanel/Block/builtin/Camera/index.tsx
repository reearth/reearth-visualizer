import { useCallback, useMemo } from "react";

import { ValueTypes } from "@reearth/beta/utils/value";

import { getFieldValue } from "../../../utils";
import { CommonProps as BlockProps } from "../../types";
import usePropertyValueUpdate from "../common/usePropertyValueUpdate";
import BlockWrapper from "../common/Wrapper";

import CameraEditor, { Props as EditorProps } from "./Editor";

export type Props = BlockProps;

const CameraBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const { handlePropertyValueUpdate, handleAddPropertyItem, handleRemovePropertyItem } =
    usePropertyValueUpdate();

  const items = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "") as EditorProps["items"],
    [block?.property?.items],
  );

  const handleAddItem = useCallback(() => {
    const schemaGroup = block?.property?.items?.find(i => i.schemaGroup === "default")?.schemaGroup;
    if (!block?.property?.id || !schemaGroup) return;
    handleAddPropertyItem(block.property.id, schemaGroup);
  }, [block?.property?.id, block?.property?.items, handleAddPropertyItem]);

  const handleUpdate = useCallback(
    (
      itemId: string,
      fieldId: string,
      fieldType: keyof ValueTypes,
      updatedValue: ValueTypes[keyof ValueTypes],
    ) => {
      const schemaGroup = block?.property?.items?.find(
        i => i.schemaGroup === "default",
      )?.schemaGroup;
      if (!block?.property?.id || !itemId || !schemaGroup) return;

      handlePropertyValueUpdate(
        schemaGroup,
        block?.property?.id,
        fieldId,
        fieldType,
        itemId,
      )(updatedValue);
    },
    [block?.property?.id, block?.property?.items, handlePropertyValueUpdate],
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      const schemaGroup = block?.property?.items?.find(
        i => i.schemaGroup === "default",
      )?.schemaGroup;
      if (!block?.property?.id || !itemId || !schemaGroup) return;

      handleRemovePropertyItem(block.property.id, schemaGroup, itemId);
    },
    [block?.property?.id, block?.property?.items, handleRemovePropertyItem],
  );

  return (
    <BlockWrapper
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      settingsEnabled={false}
      {...props}>
      <CameraEditor
        items={items}
        onUpdate={handleUpdate}
        onDeleteItem={handleDeleteItem}
        onAddItem={handleAddItem}
      />
    </BlockWrapper>
  );
};

export default CameraBlock;
