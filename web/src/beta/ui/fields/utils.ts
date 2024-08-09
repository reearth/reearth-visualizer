import { Field, Item, SchemaField } from "@reearth/services/api/propertyApi/utils";

export const filterVisibleItems = (items?: Item[]) => {
  if (!items) return;

  return items.filter(i => {
    if (!i.only) return true;
    const res = searchField(items, i.only.field);
    return res && (res[1]?.value ?? res[0].defaultValue) === i.only.value;
  });
};

const searchField = (items: Item[], fid: string): [SchemaField, Field | undefined] | undefined => {
  for (const i of items) {
    const sf2 = i.schemaFields.find(f => f.id === fid);
    if (!("fields" in i)) return;
    const field = i.fields.find(f => f.id === fid);
    if (sf2) {
      return [sf2, field];
    }
  }
  return;
};
