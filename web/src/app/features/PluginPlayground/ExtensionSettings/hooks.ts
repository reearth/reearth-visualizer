import { ListItemProps } from "@reearth/app/ui/fields/ListField";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { FieldValue } from "../types";
import { getYmlJson } from "../utils";

import type { ExtensionSettingsProps } from ".";

const ORDER_SUFFIX = "__order";
const SELECTED_SUFFIX = "__selected";

export default ({
  fieldValues,
  selectedPlugin,
  selectedFile,
  setFieldValues
}: ExtensionSettingsProps) => {
  const prevExtensionId = useRef<string>("");

  const ymlFile = useMemo(
    () => selectedPlugin.files?.find((f) => f.title.endsWith("reearth.yml")),
    [selectedPlugin.files]
  );

  const ymlJSON = useMemo(() => {
    if (!ymlFile) return null;
    const res = getYmlJson(ymlFile);
    return res.success ? res.data : null;
  }, [ymlFile]);

  const extension = useMemo(
    () =>
      ymlJSON?.extensions?.find(
        (e) => e.id === selectedFile.title.split(".")[0]
      ),
    [ymlJSON, selectedFile.title]
  );

  const getGroupBaseKey = useCallback(
    (groupId: string): string | null => {
      if (!ymlJSON?.id || !extension?.id) return null;
      return `${ymlJSON.id}-${extension.id}-${groupId}`;
    },
    [ymlJSON?.id, extension?.id]
  );

  const getFieldKeyPrefix = useCallback(
    (groupId: string, itemId?: string): string | null => {
      const base = getGroupBaseKey(groupId);
      if (!base) return null;
      return itemId ? `${base}-${itemId}-` : `${base}-`;
    },
    [getGroupBaseKey]
  );

  const getOrderKey = useCallback(
    (groupId: string): string | null => {
      const base = getGroupBaseKey(groupId);
      return base ? `${base}-${ORDER_SUFFIX}` : null;
    },
    [getGroupBaseKey]
  );

  const getSelectedKey = useCallback(
    (groupId: string): string | null => {
      const base = getGroupBaseKey(groupId);
      return base ? `${base}-${SELECTED_SUFFIX}` : null;
    },
    [getGroupBaseKey]
  );

  const getGroup = useCallback(
    (groupId: string) =>
      extension?.schema?.groups.find((g) => g.id === groupId),
    [extension?.schema?.groups]
  );

  const getGroupItemIdsFromValues = useCallback(
    (groupId: string, values: Record<string, FieldValue>): string[] => {
      const prefix = getFieldKeyPrefix(groupId);
      const group = getGroup(groupId);

      if (!prefix || !group) return [];

      const ids = new Set<string>();

      Object.keys(values).forEach((key) => {
        if (!key.startsWith(prefix)) return;

        if (
          key.endsWith(`-${ORDER_SUFFIX}`) ||
          key.endsWith(`-${SELECTED_SUFFIX}`)
        ) {
          return;
        }

        const rest = key.slice(prefix.length);

        const matchedField = group.fields.find((f) =>
          rest.endsWith(`-${f.id}`)
        );
        if (!matchedField) return;

        const itemId = rest.slice(
          0,
          rest.length - `-${matchedField.id}`.length
        );
        if (itemId) ids.add(itemId);
      });

      return Array.from(ids);
    },
    [getFieldKeyPrefix, getGroup]
  );

  const getStoredOrder = useCallback(
    (groupId: string, values: Record<string, FieldValue>): string[] => {
      const orderKey = getOrderKey(groupId);
      const raw = orderKey ? values[orderKey] : undefined;

      if (Array.isArray(raw)) {
        return raw.filter((v): v is string => typeof v === "string");
      }

      return [];
    },
    [getOrderKey]
  );

  const getOrderedGroupItemIds = useCallback(
    (groupId: string, values: Record<string, FieldValue>): string[] => {
      const actualIds = getGroupItemIdsFromValues(groupId, values);
      const actualSet = new Set(actualIds);
      const storedOrder = getStoredOrder(groupId, values);

      const ordered = storedOrder.filter((id) => actualSet.has(id));
      const unordered = actualIds.filter((id) => !ordered.includes(id));

      return [...ordered, ...unordered];
    },
    [getGroupItemIdsFromValues, getStoredOrder]
  );

  const getSelectedItemId = (
    groupId: string,
    values: Record<string, FieldValue>
  ): string => {
    const selectedKey = getSelectedKey(groupId);
    const orderedIds = getOrderedGroupItemIds(groupId, values);
    const stored = selectedKey ? values[selectedKey] : undefined;

    if (typeof stored === "string" && orderedIds.includes(stored)) {
      return stored;
    }

    return orderedIds[0] ?? "";
  };

  const updateGroupMeta = useCallback(
    (
      groupId: string,
      values: Record<string, FieldValue>,
      preferredSelected?: string
    ): Record<string, FieldValue> => {
      const next = { ...values };

      const orderedIds = getOrderedGroupItemIds(groupId, next);
      const orderKey = getOrderKey(groupId);
      const selectedKey = getSelectedKey(groupId);

      if (orderKey) {
        next[orderKey] = orderedIds;
      }

      const selected =
        preferredSelected && orderedIds.includes(preferredSelected)
          ? preferredSelected
          : (() => {
              const current = selectedKey ? next[selectedKey] : undefined;
              return typeof current === "string" && orderedIds.includes(current)
                ? current
                : (orderedIds[0] ?? "");
            })();

      if (selectedKey) {
        next[selectedKey] = selected;
      }

      return next;
    },
    [getOrderedGroupItemIds, getOrderKey, getSelectedKey]
  );

  useEffect(() => {
    if (!extension?.id || !extension.schema?.groups || !ymlJSON?.id) return;
    if (prevExtensionId.current === extension.id) return;

    let nextFieldValues = { ...fieldValues };
    let changed = false;

    extension.schema.groups.forEach((group) => {
      const isList = "list" in group && group.list;
      if (!isList) return;

      const existingIds = getGroupItemIdsFromValues(group.id, nextFieldValues);

      if (existingIds.length === 0) {
        const defaultItemId = "item-0";

        group.fields.forEach((field) => {
          const key = `${ymlJSON.id}-${extension.id}-${group.id}-${defaultItemId}-${field.id}`;
          if (!(key in nextFieldValues)) {
            nextFieldValues[key] = field.defaultValue as FieldValue;
            changed = true;
          }
        });
      }

      const beforeOrder = JSON.stringify(
        getStoredOrder(group.id, nextFieldValues)
      );
      const selectedKey = getSelectedKey(group.id);
      const beforeSelected = selectedKey
        ? nextFieldValues[selectedKey]
        : undefined;

      nextFieldValues = updateGroupMeta(group.id, nextFieldValues);

      const afterOrder = JSON.stringify(
        getStoredOrder(group.id, nextFieldValues)
      );
      const afterSelected = getSelectedKey(group.id)
        ? getSelectedKey(group.id)
          ? nextFieldValues[getSelectedKey(group.id) as string]
          : undefined
        : undefined;

      if (beforeOrder !== afterOrder || beforeSelected !== afterSelected) {
        changed = true;
      }
    });

    if (changed) {
      setFieldValues(nextFieldValues);
    }

    prevExtensionId.current = extension.id;
  }, [
    extension,
    ymlJSON?.id,
    fieldValues,
    setFieldValues,
    getGroupItemIdsFromValues,
    getStoredOrder,
    getSelectedKey,
    updateGroupMeta
  ]);

  const handleFieldValueChange = (fieldId: string, value: FieldValue) => {
    setFieldValues({
      ...fieldValues,
      [fieldId]: value
    });
  };

  const handleItemAdd = (groupId: string) => {
    if (!extension?.schema?.groups || !ymlJSON?.id) return;

    const group = getGroup(groupId);
    if (!group) return;

    const existingIds = getGroupItemIdsFromValues(groupId, fieldValues);
    const nextIndex =
      existingIds.reduce((max, id) => {
        const match = id.match(/^item-(\d+)$/);
        const n = match ? Number(match[1]) : -1;
        return Math.max(max, n);
      }, -1) + 1;

    const newItemId = `item-${nextIndex}`;
    let nextFieldValues = { ...fieldValues };

    group.fields.forEach((field) => {
      const key = `${ymlJSON.id}-${extension.id}-${groupId}-${newItemId}-${field.id}`;
      nextFieldValues[key] = field.defaultValue as FieldValue;
    });

    nextFieldValues = updateGroupMeta(groupId, nextFieldValues, newItemId);
    setFieldValues(nextFieldValues);
  };

  const handleItemDelete = (groupId: string, itemId: string) => {
    const prefix = getFieldKeyPrefix(groupId, itemId);
    if (!prefix) return;

    let nextFieldValues = { ...fieldValues };

    Object.keys(nextFieldValues).forEach((key) => {
      if (key.startsWith(prefix)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete nextFieldValues[key];
      }
    });

    nextFieldValues = updateGroupMeta(groupId, nextFieldValues);
    setFieldValues(nextFieldValues);
  };

  const handleItemMove = (
    groupId: string,
    itemId: string,
    targetIndex: number
  ) => {
    const currentOrder = getOrderedGroupItemIds(groupId, fieldValues);
    const currentIndex = currentOrder.indexOf(itemId);

    if (
      currentIndex === -1 ||
      targetIndex < 0 ||
      targetIndex >= currentOrder.length
    ) {
      return;
    }

    const nextOrder = [...currentOrder];
    nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, itemId);

    let nextFieldValues = { ...fieldValues };
    const orderKey = getOrderKey(groupId);
    const selectedKey = getSelectedKey(groupId);

    if (orderKey) {
      nextFieldValues[orderKey] = nextOrder;
    }

    if (selectedKey) {
      nextFieldValues[selectedKey] = itemId;
    }

    nextFieldValues = updateGroupMeta(groupId, nextFieldValues, itemId);
    setFieldValues(nextFieldValues);
  };

  const handleItemSelect = (groupId: string, itemId: string) => {
    const selectedKey = getSelectedKey(groupId);
    if (!selectedKey) return;

    setFieldValues({
      ...fieldValues,
      [selectedKey]: itemId
    });
  };

  const getGroupListItems = (groupId: string): ListItemProps[] => {
    if (!extension || !ymlJSON?.id) return [];

    const group = getGroup(groupId);
    if (!group) return [];

    const itemIds = getOrderedGroupItemIds(groupId, fieldValues);
    const repField =
      "representativeField" in group ? group.representativeField : undefined;

    return itemIds.map((itemId) => {
      let title = "Settings";

      if (repField) {
        const key = `${ymlJSON.id}-${extension.id}-${groupId}-${itemId}-${repField}`;
        const fieldDef = group.fields.find((f) => f.id === repField);

        title =
          fieldValues[key] !== undefined && fieldValues[key] !== null
            ? String(fieldValues[key])
            : String(fieldDef?.defaultValue ?? "Settings");
      }

      return {
        id: itemId,
        title
      };
    });
  };

  return {
    extension,
    ymlJSON,
    handleItemSelect,
    getGroupListItems,
    getSelectedItemId,
    handleItemAdd,
    handleItemDelete,
    handleItemMove,
    handleFieldValueChange
  };
};
