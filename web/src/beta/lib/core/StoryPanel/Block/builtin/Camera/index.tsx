import { useReactiveVar } from "@apollo/client";
import { useCallback, useEffect, useMemo } from "react";

import { useVisualizer } from "@reearth/beta/lib/core/Visualizer/context";
import { ValueTypes } from "@reearth/beta/utils/value";
import { currentCameraVar } from "@reearth/services/state";

import { getFieldValue } from "../../../utils";
import { CommonProps as BlockProps } from "../../types";
import usePropertyValueUpdate from "../common/useActionPropertyApi";
import BlockWrapper from "../common/Wrapper";

import CameraEditor, { Props as EditorProps } from "./Editor";

export type Props = BlockProps;

const CameraBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const {
    handlePropertyValueUpdate,
    handleAddPropertyItem,
    handleRemovePropertyItem,
    handleMovePropertyItem,
  } = usePropertyValueUpdate();

  const visualizer = useVisualizer();

  const currentCamera = useReactiveVar(currentCameraVar);
  const handleFlyTo = useMemo(() => visualizer.current?.engine.flyTo, [visualizer]);

  const items = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "") as EditorProps["items"],
    [block?.property?.items],
  );

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

  const handleItemAdd = useCallback(() => {
    const schemaGroup = block?.property?.items?.find(i => i.schemaGroup === "default")?.schemaGroup;
    if (!block?.property?.id || !schemaGroup) return;
    handleAddPropertyItem(block.property.id, schemaGroup);
  }, [block?.property?.id, block?.property?.items, handleAddPropertyItem]);

  const handleItemRemove = useCallback(
    (itemId: string) => {
      const schemaGroup = block?.property?.items?.find(
        i => i.schemaGroup === "default",
      )?.schemaGroup;
      if (!block?.property?.id || !itemId || !schemaGroup) return;

      handleRemovePropertyItem(block.property.id, schemaGroup, itemId);
    },
    [block?.property?.id, block?.property?.items, handleRemovePropertyItem],
  );

  const handleItemMove = useCallback(
    ({ id }: { id: string }, index: number) => {
      const schemaGroup = block?.property?.items?.find(
        i => i.schemaGroup === "default",
      )?.schemaGroup;
      if (!block?.property?.id || !id || !schemaGroup) return;

      handleMovePropertyItem(block.property.id, schemaGroup, { id }, index);
    },
    [block?.property?.id, block?.property?.items, handleMovePropertyItem],
  );

  // if there's no item add 1 button.
  // TODO: Shoudl be added block creationAPI for generic blocks that require at least 1 item
  useEffect(() => {
    if (items.length === 0) {
      handleItemAdd();
      return;
    }
  }, [items.length, handleItemAdd]);

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
        onItemRemove={handleItemRemove}
        onItemAdd={handleItemAdd}
        onItemMove={handleItemMove}
        currentCamera={currentCamera}
        onFlyTo={handleFlyTo}
        inEditor={!!props.isEditable}
      />
    </BlockWrapper>
  );
};

export default CameraBlock;
