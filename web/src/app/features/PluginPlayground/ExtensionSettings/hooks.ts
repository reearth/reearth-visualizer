import { useCallback, useEffect, useMemo, useState } from "react";

import { FieldValue } from "../types";
import { getYmlJson } from "../utils";

import { ExtensionSettingsProps } from ".";

type ListFieldItem = {
  id: string;
  fields: {
    id: string;
    type: string;
    value: FieldValue | undefined;
    overridden: boolean;
  }[];
};

export default ({
  fieldValues,
  selectedPlugin,
  selectedFile,
  setFieldValues
}: ExtensionSettingsProps) => {
  const [listFieldItem, setListFieldItem] = useState<
    Record<string, ListFieldItem[]>
  >({});
  const [selectedItemIds, setSelectedItemIds] = useState<
    Record<string, string | undefined>
  >({});

  const ymlFile = useMemo(
    () => selectedPlugin.files?.find((f) => f.title.endsWith("reearth.yml")),
    [selectedPlugin.files]
  );

  const ymlResult = useMemo(
    () => (ymlFile ? getYmlJson(ymlFile) : null),
    [ymlFile]
  );

  const extension = useMemo(() => {
    if (!ymlResult?.success || !ymlResult.data?.extensions) return null;
    return (
      ymlResult.data.extensions.find(
        (e) => e.id === selectedFile.title.split(".")[0]
      ) ?? null
    );
  }, [ymlResult, selectedFile.title]);

  useEffect(() => {
    if (!extension?.schema?.groups) return;
    const initialItems: Record<string, ListFieldItem[]> = {};
    for (const group of extension.schema.groups) {
      if ("list" in group && group.list === true && group.fields?.length) {
        const defaultItem: ListFieldItem = {
          id: crypto.randomUUID(),
          fields: group.fields.map((f) => ({
            id: f.id,
            type: f.type,
            value: f.defaultValue as FieldValue | undefined,
            overridden: false
          }))
        };
        initialItems[group.id] = [defaultItem];
      }
    }
    if (Object.keys(initialItems).length > 0) {
      setListFieldItem(initialItems);
      setSelectedItemIds(
        Object.fromEntries(
          Object.entries(initialItems).map(([groupId, items]) => [
            groupId,
            items[0]?.id
          ])
        )
      );
    }
  }, [extension]);

  const handleListFieldValueChange = useCallback(
    (groupId: string, itemId: string, fieldId: string, value: FieldValue) => {
      setListFieldItem((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] ?? []).map((item) =>
          item.id === itemId
            ? {
                ...item,
                fields: item.fields.map((f) =>
                  f.id === fieldId ? { ...f, value } : f
                )
              }
            : item
        )
      }));
    },
    []
  );

  const handleItemAdd = useCallback(
    (
      groupId: string,
      schemaFields: { id: string; type: string; defaultValue?: FieldValue }[]
    ) => {
      const newItem: ListFieldItem = {
        id: crypto.randomUUID(),
        fields: schemaFields.map((f) => ({
          id: f.id,
          type: f.type,
          value: f.defaultValue,
          overridden: false
        }))
      };
      setListFieldItem((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] ?? []), newItem]
      }));
    },
    []
  );

  const handleItemDelete = useCallback((groupId: string, itemId: string) => {
    setListFieldItem((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] ?? []).filter((item) => item.id !== itemId)
    }));
  }, []);

  const handleItemMove = useCallback(
    (groupId: string, itemId: string, targetIndex: number) => {
      setListFieldItem((prev) => {
        const items = [...(prev[groupId] ?? [])];
        const currentIndex = items.findIndex((i) => i.id === itemId);
        if (currentIndex === -1) return prev;
        const [moved] = items.splice(currentIndex, 1);
        items.splice(targetIndex, 0, moved);
        return { ...prev, [groupId]: items };
      });
    },
    []
  );

  const handleFieldValueChange = useCallback(
    (fieldId: string, value: FieldValue) => {
      setFieldValues({ ...fieldValues, [fieldId]: value });
    },
    [fieldValues, setFieldValues]
  );

  return {
    ymlResult,
    extension,
    ymlFile,
    listFieldItem,
    selectedItemIds,
    setSelectedItemIds,
    handleListFieldValueChange,
    handleFieldValueChange,
    handleItemAdd,
    handleItemDelete,
    handleItemMove
  };
};
