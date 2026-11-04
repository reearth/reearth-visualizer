import { Collapse } from "@reearth/app/lib/reearth-ui";
import ListField from "@reearth/app/ui/fields/ListField";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import {
  addListItem,
  deleteListItem,
  fieldKey,
  getListItemIds,
  getSelectedItemId,
  moveListItem,
  selectListItem
} from "./properties";
import PropertyField from "./PropertyField";
import type {
  FieldValue,
  FieldValues,
  PluginExtension,
  SchemaGroupDef
} from "./types";

type Props = {
  pluginId: string;
  extension: PluginExtension;
  values: FieldValues;
  onFieldChange: (key: string, value: FieldValue) => void;
  setValues: (update: (prev: FieldValues) => FieldValues) => void;
};

const listTitle = (
  group: SchemaGroupDef,
  values: FieldValues,
  pluginId: string,
  extensionId: string,
  itemId: string
) => {
  const rep = group.fields.find((f) => f.id === group.representativeField);
  if (!rep) return "Settings";
  const stored =
    values[fieldKey(pluginId, extensionId, group.id, rep.id, itemId)];
  return String(stored ?? rep.defaultValue ?? "Settings");
};

/** A collapsible group of fields per schema group of the extension. */
const ExtensionSettings: FC<Props> = ({
  pluginId,
  extension,
  values,
  onFieldChange,
  setValues
}) => (
  <Wrapper>
    {(extension.schema?.groups ?? []).map((group) => {
      const itemIds = group.list
        ? getListItemIds(values, pluginId, extension.id, group)
        : [];
      const selected = group.list
        ? getSelectedItemId(values, pluginId, extension.id, group)
        : undefined;

      return (
        <Collapse key={group.id} title={group.title ?? group.id}>
          <Fields>
            {group.list && (
              <ListField
                items={itemIds.map((id) => ({
                  id,
                  title: listTitle(group, values, pluginId, extension.id, id)
                }))}
                selected={selected}
                isEditable={false}
                onItemSelect={(id) =>
                  setValues((prev) =>
                    selectListItem(prev, pluginId, extension.id, group.id, id)
                  )
                }
                onItemAdd={() =>
                  setValues((prev) =>
                    addListItem(prev, pluginId, extension.id, group)
                  )
                }
                onItemDelete={(id) =>
                  setValues((prev) =>
                    deleteListItem(prev, pluginId, extension.id, group, id)
                  )
                }
                onItemMove={(id, index) =>
                  setValues((prev) =>
                    moveListItem(prev, pluginId, extension.id, group, id, index)
                  )
                }
              />
            )}
            {(!group.list || selected) &&
              group.fields.map((field) => {
                const key = fieldKey(
                  pluginId,
                  extension.id,
                  group.id,
                  field.id,
                  selected
                );
                return (
                  <PropertyField
                    key={key}
                    field={field}
                    value={values[key]}
                    onChange={(v) => onFieldChange(key, v)}
                  />
                );
              })}
          </Fields>
        </Collapse>
      );
    })}
  </Wrapper>
);

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  padding: theme.spacing.small
}));

const Fields = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal
}));

export default ExtensionSettings;
