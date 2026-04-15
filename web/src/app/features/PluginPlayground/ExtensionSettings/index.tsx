import { Collapse } from "@reearth/app/lib/reearth-ui";
import { ListField } from "@reearth/app/ui/fields";
import { ListItemProps } from "@reearth/app/ui/fields/ListField";
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
  fieldValues?: Record<string, FieldValue>;
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
    ymlFile,
    ymlResult,
    extension,
    listFieldItem,
    selectedItemIds,
    setSelectedItemIds,
    handleFieldValueChange,
    handleItemAdd,
    handleItemDelete,
    handleItemMove,
    handleListFieldValueChange
  } = useHooks({ selectedPlugin, selectedFile, fieldValues, setFieldValues });

  if (!ymlFile) {
    return (
      <Wrapper>
        <ErrorMessage>
          This plugin does not have a reearth.yml file.
        </ErrorMessage>
      </Wrapper>
    );
  }

  if (!ymlResult?.success) {
    return (
      <Wrapper>
        <ErrorMessage>{ymlResult?.message}</ErrorMessage>
      </Wrapper>
    );
  }

  const ymlJSON = ymlResult.data;

  if (!ymlJSON || !ymlJSON.extensions) {
    return (
      <Wrapper>
        <ErrorMessage>
          {t("This plugin does not have a valid reearth.yml file.")}
        </ErrorMessage>
      </Wrapper>
    );
  }

  return extension?.schema?.groups && extension.schema.groups.length > 0 ? (
    <Wrapper>
      {extension.schema.groups.map((group) => {
        const isList = "list" in group && group.list === true;
        const groupItems = listFieldItem[group.id] ?? [];
        const selectedItemId = selectedItemIds[group.id];
        const selectedItem = groupItems.find((i) => i.id === selectedItemId);

        const repFieldId =
          "representativeField" in group
            ? (group as { representativeField?: string }).representativeField
            : undefined;
        const repSchemaField = repFieldId
          ? group.fields.find((f) => f.id === repFieldId)
          : undefined;

        const listFieldItems: ListItemProps[] = groupItems.map((item) => {
          const repField = repFieldId
            ? item.fields.find((f) => f.id === repFieldId)
            : undefined;
          const repValue = repField?.value ?? repSchemaField?.defaultValue;
          const repTitle =
            typeof repValue === "string" || typeof repValue === "number"
              ? String(repValue)
              : undefined;
          return {
            id: item.id,
            title: repTitle ?? t("New Item")
          };
        });

        return (
          <Collapse title={group.title} key={group.id}>
            <FieldsWrapper>
              {isList && (
                <ListField
                  items={listFieldItems}
                  selected={selectedItemId}
                  atLeastOneItem
                  onItemSelect={(id) =>
                    setSelectedItemIds((prev) => ({
                      ...prev,
                      [group.id]: id
                    }))
                  }
                  onItemAdd={() =>
                    handleItemAdd(
                      group.id,
                      group.fields.map(f => ({
                        id: f.id,
                        type: f.type,
                        defaultValue: f.defaultValue as FieldValue | undefined
                      }))
                    )
                  }
                  onItemDelete={(id) => handleItemDelete(group.id, id)}
                  onItemMove={(id, index) =>
                    handleItemMove(group.id, id, index)
                  }
                  isEditable={false}
                />
              )}

              {(!isList || selectedItem) &&
                group.fields.map((field) => {
                  const itemField = selectedItem?.fields.find(
                    (f) => f.id === field.id
                  );

                  const id = isList
                    ? `${ymlJSON.id}-${extension.id}-${group.id}-${selectedItem?.id}-${field.id}`
                    : `${ymlJSON.id}-${extension.id}-${group.id}-${field.id}`;

                  const value = isList ? itemField?.value : fieldValues?.[id];

                  const onUpdate = isList
                    ? (_: string, value: FieldValue) => {
                        if (!selectedItem) return;
                        handleListFieldValueChange(
                          group.id,
                          selectedItem.id,
                          field.id,
                          value
                        );
                      }
                    : handleFieldValueChange;

                  return (
                    <PropertyItem
                      key={field.id}
                      id={id}
                      field={field}
                      value={value as FieldValue}
                      onUpdate={onUpdate}
                    />
                  );
                })}
            </FieldsWrapper>
          </Collapse>
        );
      })}
    </Wrapper>
  ) : (
    <Wrapper>
      <ErrorMessage>{t("No valid schema defined.")}</ErrorMessage>
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
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.body
}));

export default ExtensionSettings;
