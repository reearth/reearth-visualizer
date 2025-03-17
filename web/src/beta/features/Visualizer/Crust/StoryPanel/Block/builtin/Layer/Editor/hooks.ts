import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { debounce } from "lodash-es";
import { useCallback, useMemo } from "react";

import type { Field } from "../../../../types";

export type LayerBlock = {
  id: string;
  title?: Field<string>;
  color?: Field<string>;
  bgColor?: Field<string>;
  showLayers?: Field<string[]>;
};
export default ({
  items,
  propertyId,
  selected,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove,
  nlsLayers
}: {
  items: LayerBlock[];
  propertyId?: string;
  selected?: string;
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
  nlsLayers?: NLSLayer[];
}) => {
  const t = useT();

  const layers = useMemo(
    () =>
      nlsLayers
        ?.sort((a, b) => {
          return (a?.index ?? 0) - (b?.index ?? 0);
        })
        .map(({ id, title }) => ({
          value: id,
          label: title ?? `Layer: ${id}`
        })) || [],
    [nlsLayers]
  );

  const editorProperties = useMemo(
    () => items.find((i) => i.id === selected),
    [items, selected]
  );

  const handlePropertyValueUpdate = useCallback(
    (
      schemaGroupId: string,
      propertyId: string,
      fieldId: string,
      vt: any,
      itemId?: string
    ) => {
      return async (v?: any) => {
        await onPropertyUpdate?.(
          propertyId,
          schemaGroupId,
          fieldId,
          itemId,
          vt,
          v
        );
      };
    },
    [onPropertyUpdate]
  );

  const handleUpdate = useCallback(
    (itemId: string, fieldId: string, fieldType: any, updatedValue: any) => {
      if (!propertyId || !itemId) return;

      handlePropertyValueUpdate(
        "default",
        propertyId,
        fieldId,
        fieldType,
        itemId
      )(updatedValue);
    },
    [propertyId, handlePropertyValueUpdate]
  );

  const debounceOnUpdate = useMemo(
    () => debounce(handleUpdate, 500),
    [handleUpdate]
  );

  const listItems = useMemo(
    () =>
      items.map(({ id, title }) => ({
        id,
        title: title?.value ?? t("New Layers Button")
      })),
    [items, t]
  );

  const handleItemAdd = useCallback(() => {
    if (!propertyId) return;
    onPropertyItemAdd?.(propertyId, "default");
  }, [propertyId, onPropertyItemAdd]);

  const handleItemRemove = useCallback(
    (itemId: string) => {
      if (!propertyId || !itemId) return;

      onPropertyItemDelete?.(propertyId, "default", itemId);
    },
    [propertyId, onPropertyItemDelete]
  );

  const handleItemMove = useCallback(
    (id: string, index: number) => {
      if (!propertyId || !id) return;

      onPropertyItemMove?.(propertyId, "default", id, index);
    },
    [propertyId, onPropertyItemMove]
  );

  return {
    layers,
    editorProperties,
    debounceOnUpdate,
    listItems,
    handleItemAdd,
    handleItemRemove,
    handleItemMove
  };
};
