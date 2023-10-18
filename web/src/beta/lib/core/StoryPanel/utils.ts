import { ValueTypes, ValueType } from "@reearth/beta/utils/value";
import type { Item } from "@reearth/services/api/propertyApi/utils";

import type { Spacing } from "../mantle";

export const getFieldValue = (items: Item[], fieldId: string, fieldGroup?: string) => {
  const d = items.find(i => i.schemaGroup === (fieldGroup ?? "default")) ?? items[0];
  const isList = d && "items" in d;
  const schemaField = d?.schemaFields.find(sf => sf.id === fieldId);
  return !isList
    ? d?.fields.find(f => f.id === schemaField?.id)?.value
    : d.items.map(item => ({
        id: item.id,
        ...item.fields.reduce((obj: { [id: string]: ValueTypes[ValueType] | undefined }, field) => {
          obj[field.id] = field.value;
          return obj;
        }, {}),
      }));
};

export const calculatePaddingValue = (
  defaultValue: Spacing,
  value?: Spacing,
  editorMode?: boolean,
) => {
  const calculateValue = (position: keyof Spacing, v?: number): { [key: string]: number } => {
    if (!v) {
      return {
        [position]: editorMode ? defaultValue[position] : 0,
      };
    }
    return {
      [position]: editorMode && v < defaultValue[position] ? defaultValue[position] : v,
    };
  };

  return value
    ? Object.assign(
        {},
        ...Object.keys(value).map(p =>
          calculateValue(p as keyof Spacing, value[p as keyof Spacing]),
        ),
      )
    : defaultValue;
};
