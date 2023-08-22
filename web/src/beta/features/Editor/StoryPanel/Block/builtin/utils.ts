import { type Item } from "@reearth/services/api/propertyApi/utils";

export const getFieldValue = (fieldId: string, items?: Item[]) => {
  const d = items?.find(i => i.schemaGroup === "default");
  const isList = d && "items" in d;
  const schemaField = d?.schemaFields.find(sf => sf.id === fieldId);
  return (!isList ? d?.fields.find(f => f.id === schemaField?.id) : schemaField?.defaultValue) as
    | string
    | undefined;
};
