import { Collapse } from "@reearth/app/lib/reearth-ui";
import ListField from "@reearth/app/ui/fields/ListField";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

import { FileType } from "../Plugins/constants";
import { FieldValue } from "../types";

import useHooks from "./hooks";
import PropertyItem from "./PropertyItem";

export type ExtensionSettingsProps = {
  selectedPlugin: {
    id: string;
    files: {
      id: string;
      title: string;
      sourceCode: string;
    }[];
  };
  selectedFile: FileType;
  fieldValues: Record<string, FieldValue>;
  setFieldValues: (fieldValues: Record<string, FieldValue>) => void;
};

const ExtensionSettings: FC<ExtensionSettingsProps> = ({
  selectedPlugin,
  selectedFile,
  fieldValues,
  setFieldValues
}): ReactNode => {
  const t = useT();
  const {
    extension,
    ymlJSON,
    handleItemSelect,
    getGroupListItems,
    getSelectedItemId,
    handleItemAdd,
    handleItemDelete,
    handleItemMove,
    handleFieldValueChange
  } = useHooks({ selectedPlugin, selectedFile, fieldValues, setFieldValues });

  if (!extension?.schema?.groups) {
    return (
      <Wrapper>
        <ErrorMessage>{t("No valid schema defined.")}</ErrorMessage>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {extension.schema.groups.map((group) => {
        const isList = "list" in group && !!group.list;
        const selectedItemId = isList
          ? getSelectedItemId(group.id, fieldValues)
          : "";
        const listItems = isList ? getGroupListItems(group.id) : [];

        return (
          <Collapse key={group.id} title={group.title}>
            <FieldsWrapper>
              {isList && (
                <ListField
                  items={listItems}
                  selected={selectedItemId}
                  onItemSelect={(itemId) => handleItemSelect(group.id, itemId)}
                  onItemAdd={() => handleItemAdd(group.id)}
                  onItemDelete={(itemId) => handleItemDelete(group.id, itemId)}
                  onItemMove={(itemId, targetIndex) =>
                    handleItemMove(group.id, itemId, targetIndex)
                  }
                  atLeastOneItem
                  isEditable={false}
                />
              )}

              {group.fields.map((field) => {
                if (isList && !selectedItemId) return null;

                const id = isList
                  ? `${ymlJSON?.id}-${extension.id}-${group.id}-${selectedItemId}-${field.id}`
                  : `${ymlJSON?.id}-${extension.id}-${group.id}-${field.id}`;

                return (
                  <PropertyItem
                    key={id}
                    id={id}
                    field={field}
                    value={fieldValues[id]}
                    onUpdate={handleFieldValueChange}
                  />
                );
              })}
            </FieldsWrapper>
          </Collapse>
        );
      })}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  padding: theme.spacing.small,
  flexDirection: "column",
  gap: theme.spacing.small
}));

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal
}));

const ErrorMessage = styled("p")(({ theme }) => ({
  color: theme.content.weak
}));

export default ExtensionSettings;
