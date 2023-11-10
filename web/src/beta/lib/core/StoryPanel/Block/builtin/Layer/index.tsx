import { useCallback, useMemo, useEffect } from "react";

import { type ValueTypes } from "@reearth/beta/utils/value";

import type { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

import LayerBlockEditor, { type LayerBlock as LayerBlockType } from "./Editor";

export type Props = BlockProps;

const LayerBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const showLayerButtons = useMemo(
    () => (block?.property?.default ?? []) as LayerBlockType[],
    [block?.property?.default],
  );

  const handlePropertyValueUpdate = useCallback(
    (schemaGroupId: string, propertyId: string, fieldId: string, vt: any, itemId?: string) => {
      return async (v?: any) => {
        await props.onPropertyUpdate?.(propertyId, schemaGroupId, fieldId, itemId, vt, v);
      };
    },
    [props],
  );

  const handleUpdate = useCallback(
    (
      itemId: string,
      fieldId: string,
      fieldType: keyof ValueTypes,
      updatedValue: ValueTypes[keyof ValueTypes] | undefined,
    ) => {
      if (!block?.propertyId || !itemId) return;

      console.log(itemId, fieldId, fieldType, updatedValue);

      handlePropertyValueUpdate(
        "default",
        block?.propertyId,
        fieldId,
        fieldType,
        itemId,
      )(updatedValue);
    },
    [block?.propertyId, handlePropertyValueUpdate],
  );

  const handleItemAdd = useCallback(() => {
    if (!block?.propertyId) return;
    props.onPropertyItemAdd?.(block.propertyId, "default");
  }, [block?.propertyId, props]);

  const handleItemRemove = useCallback(
    (itemId: string) => {
      if (!block?.propertyId || !itemId) return;

      props.onPropertyItemDelete?.(block.propertyId, "default", itemId);
    },
    [block?.propertyId, props],
  );

  const handleItemMove = useCallback(
    ({ id }: { id: string }, index: number) => {
      if (!block?.propertyId || !id) return;

      props.onPropertyItemMove?.(block.propertyId, "default", id, index);
    },
    [block?.propertyId, props],
  );

  // if there's no item add 1 button.
  // TODO: Should be added to block creationAPI for generic blocks that require at least 1 item
  useEffect(() => {
    if (!showLayerButtons || showLayerButtons.length === 0) {
      handleItemAdd();
      return;
    }
  }, [showLayerButtons, handleItemAdd, handleUpdate]);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      settingsEnabled={false}
      {...props}>
      <LayerBlockEditor
        items={showLayerButtons}
        onUpdate={handleUpdate}
        onItemRemove={handleItemRemove}
        onItemAdd={handleItemAdd}
        onItemMove={handleItemMove}
        inEditor={!!props.isEditable}
      />
    </BlockWrapper>
  );
};

export default LayerBlock;
