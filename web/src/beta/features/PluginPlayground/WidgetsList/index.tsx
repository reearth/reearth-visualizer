import PropertyItem from "@reearth/beta/ui/fields/Properties";
import { Item } from "@reearth/services/api/propertyApi/utils";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { CustomField, Group } from "../types";
import { getYmlJson } from "../utils";

type Props = {
  selectedPlugin: {
    id: string;
    title: string;
    files: {
      id: string;
      title: string;
      sourceCode: string;
    }[];
  };
};
const WidgetsList: FC<Props> = ({ selectedPlugin }): JSX.Element => {
  const ymlFile =
    selectedPlugin.files &&
    selectedPlugin.files.find((f) => f.title.endsWith("reearth.yml"));

  if (!ymlFile) return <div />;

  const getYmlResult = getYmlJson(ymlFile);

  if (!getYmlResult.success) {
    // setNotification({ type: "error", text: getYmlResult.message });
    // return;
  }

  const ymlJSON = getYmlResult.data;

  if (!ymlJSON || !ymlJSON.extensions) return <div />;

  const widgetExtension = ymlJSON.extensions.find((e) => e.type === "widget");

  if (
    !widgetExtension ||
    !widgetExtension.schema ||
    !widgetExtension.schema.groups
  )
    return <div />;

  const widgetSchema = widgetExtension.schema.groups;

  if (!widgetSchema || widgetSchema.length == 0) return <div />;

  function transformData(inputData: Group): {
    propertyId: string;
    item: {
      id: string;
      title: string;
      schemaGroup: string;
      schemaFields: {
        id: string;
        type: string;
        ui: string;
        name: string;
        only: null;
        defaultValue: unknown;
        choices?: { key: string; label: string }[];
      }[];
      fields: {
        id: string;
        value: unknown;
        type: string;
      }[];
      representativeField: string | null;
    };
    onFlyTo: () => void;
  } {
    if (!Array.isArray(inputData) || inputData.length === 0) {
      throw new Error("Input data must be a non-empty array");
    }

    const firstItem = inputData[0];

    const transformedFields = firstItem.fields.map((field: CustomField) => ({
      id: field.id || "",
      type: field.type || "",
      ui: field.ui || "",
      title: field.title || "",
      only: null,
      defaultValue: getDefaultValueForType(field.type as string)
    }));

    const schemaFields = transformedFields.map((field: CustomField) => ({
      id: field.id || "",
      type: field.type || "",
      ui: field.ui || "",
      name: field.title || "",
      only: null,
      defaultValue: getDefaultValueForType(field.type as string),
      choices: field.type === "url" ? [] : undefined
    }));

    const fields = transformedFields.map((field: CustomField) => ({
      id: field.id || "",
      value: field.defaultValue,
      type: field.type || ""
    }));

    return {
      propertyId: `${firstItem.id}Property`,
      item: {
        id: firstItem.id,
        title: firstItem.title,
        schemaGroup: `${firstItem.id}Group`,
        schemaFields,
        fields,
        representativeField: fields[0]?.id || null
      },
      onFlyTo: () => {
        console.log("Fly to action triggered");
      }
    };
  }

  function getDefaultValueForType(type: string) {
    switch (type) {
      case "string":
        return "";
      case "number":
        return 0;
      case "boolean":
        return false;
      case "url":
        return "";
      case "date":
        return new Date().toISOString();
      default:
        return null;
    }
  }

  const transformed = transformData(widgetSchema);

  return (
    <Wrapper>
      <PropertyItem
        item={transformed.item as unknown as Item}
        propertyId={transformed.propertyId}
        shouldUpdatePropertyItem={false}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 10px;
`;

export default WidgetsList;
