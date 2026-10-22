import type {
  FieldValue,
  FieldValues,
  PluginExtension,
  SchemaGroupDef
} from "./types";

const ORDER = "__order";
const SELECTED = "__selected";

const base = (pluginId: string, extensionId: string, groupId: string) =>
  `${pluginId}-${extensionId}-${groupId}`;

/** The key a field's value is stored under. */
export const fieldKey = (
  pluginId: string,
  extensionId: string,
  groupId: string,
  fieldId: string,
  itemId?: string
) =>
  itemId
    ? `${base(pluginId, extensionId, groupId)}-${itemId}-${fieldId}`
    : `${base(pluginId, extensionId, groupId)}-${fieldId}`;

const groupsOf = (extension: PluginExtension): SchemaGroupDef[] =>
  extension.schema?.groups ?? [];

/** Item ids of a list group, in order. A list can be empty. */
export const getListItemIds = (
  values: FieldValues,
  pluginId: string,
  extensionId: string,
  group: SchemaGroupDef
): string[] => {
  const prefix = `${base(pluginId, extensionId, group.id)}-`;
  const found = new Set<string>();
  for (const key of Object.keys(values)) {
    if (!key.startsWith(prefix)) continue;
    const rest = key.slice(prefix.length);
    if (rest === ORDER || rest === SELECTED) continue;
    const field = group.fields.find((f) => rest.endsWith(`-${f.id}`));
    if (!field) continue;
    const itemId = rest.slice(0, rest.length - field.id.length - 1);
    if (itemId) found.add(itemId);
  }
  const order = values[`${prefix}${ORDER}`];
  const ordered = Array.isArray(order)
    ? order.filter(
        (id): id is string => typeof id === "string" && found.has(id)
      )
    : [];
  return [...ordered, ...[...found].filter((id) => !ordered.includes(id))];
};

/**
 * The property object a plugin receives: `{ [groupId]: { [fieldId]: value } }`,
 * or an array of those for list groups. Only `undefined` falls back to the
 * schema's default, so `false`, `0` and `""` are kept.
 */
export const generateProperty = (
  extension: PluginExtension,
  pluginId: string,
  values: FieldValues
): Record<string, unknown> => {
  const property: Record<string, unknown> = {};
  for (const group of groupsOf(extension)) {
    if (group.list) {
      property[group.id] = getListItemIds(
        values,
        pluginId,
        extension.id,
        group
      ).map((itemId) =>
        Object.fromEntries(
          group.fields.map((f) => [
            f.id,
            values[fieldKey(pluginId, extension.id, group.id, f.id, itemId)] ??
              f.defaultValue
          ])
        )
      );
    } else {
      property[group.id] = Object.fromEntries(
        group.fields.map((f) => [
          f.id,
          values[fieldKey(pluginId, extension.id, group.id, f.id)] ??
            f.defaultValue
        ])
      );
    }
  }
  return property;
};

/** Whether anything is stored for this extension. */
export const hasStoredValues = (
  extension: PluginExtension,
  pluginId: string,
  values: FieldValues
) =>
  groupsOf(extension).some((g) => {
    const prefix = `${base(pluginId, extension.id, g.id)}-`;
    return Object.keys(values).some((k) => k.startsWith(prefix));
  });

/** Drops everything stored for one extension, so its defaults apply again. */
export const clearStoredValues = (
  extension: PluginExtension,
  pluginId: string,
  values: FieldValues
): FieldValues => {
  const prefixes = groupsOf(extension).map(
    (g) => `${base(pluginId, extension.id, g.id)}-`
  );
  return Object.fromEntries(
    Object.entries(values).filter(
      ([key]) => !prefixes.some((p) => key.startsWith(p))
    )
  );
};

export const setFieldValue = (
  values: FieldValues,
  key: string,
  value: FieldValue
): FieldValues => ({ ...values, [key]: value });

const orderKey = (p: string, e: string, g: string) =>
  `${base(p, e, g)}-${ORDER}`;
const selectedKey = (p: string, e: string, g: string) =>
  `${base(p, e, g)}-${SELECTED}`;

/** The selected item of a list group; the first one when none is. */
export const getSelectedItemId = (
  values: FieldValues,
  pluginId: string,
  extensionId: string,
  group: SchemaGroupDef
): string => {
  const ids = getListItemIds(values, pluginId, extensionId, group);
  const stored = values[selectedKey(pluginId, extensionId, group.id)];
  return typeof stored === "string" && ids.includes(stored)
    ? stored
    : (ids[0] ?? "");
};

export const selectListItem = (
  values: FieldValues,
  pluginId: string,
  extensionId: string,
  groupId: string,
  itemId: string
): FieldValues => ({
  ...values,
  [selectedKey(pluginId, extensionId, groupId)]: itemId
});

/** Adds an item holding the defaults, and selects it. */
export const addListItem = (
  values: FieldValues,
  pluginId: string,
  extensionId: string,
  group: SchemaGroupDef
): FieldValues => {
  const ids = getListItemIds(values, pluginId, extensionId, group);
  const next =
    ids.reduce((max, id) => {
      const n = /^item-(\d+)$/.exec(id);
      return n ? Math.max(max, Number(n[1])) : max;
    }, -1) + 1;
  const itemId = `item-${next}`;
  const out: FieldValues = { ...values };
  for (const f of group.fields) {
    out[fieldKey(pluginId, extensionId, group.id, f.id, itemId)] =
      f.defaultValue ?? "";
  }
  out[orderKey(pluginId, extensionId, group.id)] = [...ids, itemId];
  out[selectedKey(pluginId, extensionId, group.id)] = itemId;
  return out;
};

export const deleteListItem = (
  values: FieldValues,
  pluginId: string,
  extensionId: string,
  group: SchemaGroupDef,
  itemId: string
): FieldValues => {
  const ids = getListItemIds(values, pluginId, extensionId, group);
  const prefix = `${base(pluginId, extensionId, group.id)}-${itemId}-`;
  const out: FieldValues = Object.fromEntries(
    Object.entries(values).filter(([k]) => !k.startsWith(prefix))
  );
  out[orderKey(pluginId, extensionId, group.id)] = ids.filter(
    (id) => id !== itemId
  );
  return out;
};

export const moveListItem = (
  values: FieldValues,
  pluginId: string,
  extensionId: string,
  group: SchemaGroupDef,
  itemId: string,
  targetIndex: number
): FieldValues => {
  const ids = getListItemIds(values, pluginId, extensionId, group);
  const from = ids.indexOf(itemId);
  if (from === -1 || targetIndex < 0 || targetIndex >= ids.length) {
    return values;
  }
  const order = [...ids];
  order.splice(from, 1);
  order.splice(targetIndex, 0, itemId);
  return {
    ...values,
    [orderKey(pluginId, extensionId, group.id)]: order,
    [selectedKey(pluginId, extensionId, group.id)]: itemId
  };
};
