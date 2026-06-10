import { ValueType, ValueTypes, zeroValues } from "@reearth/app/utils/value";
import { FlyTo } from "@reearth/core";
import type {
  Group,
  GroupListItem,
  Item
} from "@reearth/services/api/property";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useMemo, useState } from "react";

import ListField, { ListItemProps } from "../ListField";

import useHooks from "./hooks";
import PropertyField, { PropertyFieldDecorations } from "./PropertyField";

export type FieldContext = {
  id: string;
  value: unknown;
};

type Props = {
  propertyId: string;
  item?: Item;
  onFlyTo?: FlyTo;
  computeDecorations?: (
    schemaId: string,
    schemaGroup: string,
    value: unknown,
    allFields: FieldContext[],
    allListItemsFields?: FieldContext[][]
  ) => PropertyFieldDecorations;
};

const PropertyItem: FC<Props> = ({
  propertyId,
  item,
  onFlyTo,
  computeDecorations
}) => {
  const t = useT();
  const [selected, select] = useState<string>();
  const {
    handlePropertyItemDelete,
    handlePropertyItemAdd,
    handlePropertyItemMove
  } = useHooks(propertyId, item?.schemaGroup || "");

  const isList = item && "items" in item;
  const layerMode = useMemo(() => {
    if (!isList || !item?.representativeField) return false;
    const sf = item.schemaFields.find((f) => f.id === item.representativeField);
    return sf?.type === "ref" && sf.ui === "layer";
  }, [isList, item?.representativeField, item?.schemaFields]);

  const groups = useMemo<(GroupListItem | Group)[]>(
    () => (item && "items" in item ? item.items : item ? [item] : []),
    [item]
  );

  const selectedItem = isList
    ? groups.find((g) => g.id === selected)
    : groups[0];

  const propertyListItems = useMemo(
    () =>
      groups
        .map<ListItemProps | undefined>((i) => {
          if (!i.id) return;

          const representativeField = item?.representativeField
            ? i.fields.find((f) => f.id === item.representativeField)
            : undefined;
          const nameSchemaField = item?.schemaFields?.find(
            (sf) => sf.id === item.representativeField
          );

          // Apply default tile type override for tile_type field in tiles group
          let value = representativeField?.value;
          if (!value) {
            if (
              item?.representativeField === "tile_type" &&
              item?.schemaGroup === "tiles"
            ) {
              const overriddenDefault = appFeature()?.defaultTileType;
              value = overriddenDefault ?? nameSchemaField?.defaultValue;
            } else {
              value = nameSchemaField?.defaultValue;
            }
          }

          const choice = nameSchemaField?.choices
            ? nameSchemaField?.choices?.find((c) => c.key === value)?.label
            : undefined;

          const title = valueToString(choice || value);

          return {
            id: i.id,
            title: (!layerMode ? title : undefined) ?? t("Settings"),
            layerId: layerMode ? title : undefined
          };
        })
        .filter((g): g is ListItemProps => !!g),
    [groups, layerMode, item, t]
  );
  const schemaFields = useMemo(
    () =>
      selectedItem
        ? item?.schemaFields.map((f) => {
            const field = selectedItem?.fields.find((f2) => f2.id === f.id);
            const condf =
              f.only &&
              selectedItem?.fields.find((f2) => f2.id === f.only?.field);
            const condsf =
              f.only && item.schemaFields.find((f2) => f2.id === f.only?.field);
            const condv =
              condf?.value ??
              condf?.mergedValue ??
              condsf?.defaultValue ??
              (condsf?.type ? zeroValues[condsf.type] : undefined);
            return {
              schemaField: f,
              field,
              hidden: f.only && (!condv || condv !== f.only.value)
            };
          })
        : [],
    [item?.schemaFields, selectedItem]
  );

  return (
    <FieldsWrapper>
      {isList && !!item && (
        <ListField
          title={item.title || (item.id === "default" ? "defaultItemName" : "")}
          items={propertyListItems}
          selected={selected}
          onItemSelect={select}
          onItemAdd={handlePropertyItemAdd}
          onItemDelete={handlePropertyItemDelete}
          onItemMove={handlePropertyItemMove}
          atLeastOneItem
          isEditable={false}
        />
      )}
      {!!item &&
        (() => {
          // Build context of all list items for decoration computation
          const allListItemsFields: FieldContext[][] | undefined = isList
            ? groups.map((group) =>
                item.schemaFields
                  .map((sf) => {
                    const field = group.fields.find((f) => f.id === sf.id);

                    // Use same value resolution as PropertyField to ensure consistency
                    let resolvedValue: unknown;
                    if (sf.id === "tile_type" && item.schemaGroup === "tiles") {
                      // Apply default tile type override for tile_type field in tiles group
                      const overriddenDefault = appFeature()?.defaultTileType;
                      resolvedValue = field?.mergedValue ?? field?.value ?? overriddenDefault ?? sf.defaultValue;
                    } else {
                      resolvedValue = field?.mergedValue ?? field?.value ?? sf.defaultValue;
                    }

                    return {
                      id: sf.id,
                      value: resolvedValue
                    };
                  })
              )
            : undefined;

          return schemaFields?.map((f) => {
            if (
              (layerMode && f.schemaField.id === item.representativeField) ||
              f.hidden
            )
              return null;

            // Build context of all fields for decoration computation
            const allFields: FieldContext[] = schemaFields
              .filter((sf) => !sf.hidden)
              .map((sf) => {
                // Use same value resolution as PropertyField to ensure consistency
                let resolvedValue: unknown;
                if (sf.schemaField.id === "tile_type" && item.schemaGroup === "tiles") {
                  // Apply default tile type override for tile_type field in tiles group
                  const overriddenDefault = appFeature()?.defaultTileType;
                  resolvedValue = sf.field?.mergedValue ?? sf.field?.value ?? overriddenDefault ?? sf.schemaField.defaultValue;
                } else {
                  resolvedValue = sf.field?.mergedValue ?? sf.field?.value ?? sf.schemaField.defaultValue;
                }

                return {
                  id: sf.schemaField.id,
                  value: resolvedValue
                };
              });

            // Compute decorations for this field (business logic from parent)
            const decorations = computeDecorations?.(
              f.schemaField.id,
              item.schemaGroup,
              f.field?.value,
              allFields,
              allListItemsFields
            );

          return (
            <PropertyField
              key={f.schemaField.id}
              propertyId={propertyId}
              schemaGroup={item.schemaGroup}
              field={f.field}
              itemId={selected}
              schema={f.schemaField}
              onFlyTo={onFlyTo}
              decorations={decorations}
            />
          );
        });
        })()}
    </FieldsWrapper>
  );
};

export default PropertyItem;

const valueToString = (
  v: ValueTypes[ValueType] | undefined
): string | undefined => {
  if (typeof v === "string" || typeof v === "number") {
    return v.toString();
  }
  return undefined;
};

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large
}));
