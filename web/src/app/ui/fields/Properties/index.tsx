import { ValueType, ValueTypes, zeroValues } from "@reearth/app/utils/value";
import { FlyTo } from "@reearth/core";
import {
  Group,
  GroupListItem,
  Item
} from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo, useState } from "react";

import ListField, { ListItemProps } from "../ListField";

import useHooks from "./hooks";
import PropertyField from "./PropertyField";

type Props = {
  propertyId: string;
  item?: Item;
  onFlyTo?: FlyTo;
};

const PropertyItem: FC<Props> = ({ propertyId, item, onFlyTo }) => {
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

          const value =
            representativeField?.value || nameSchemaField?.defaultValue;

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
        schemaFields?.map((f) => {
          if (
            (layerMode && f.schemaField.id === item.representativeField) ||
            f.hidden
          )
            return null;
          return (
            <PropertyField
              key={f.schemaField.id}
              propertyId={propertyId}
              schemaGroup={item.schemaGroup}
              field={f.field}
              itemId={selected}
              schema={f.schemaField}
              onFlyTo={onFlyTo}
            />
          );
        })}
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
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));
