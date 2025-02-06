import { SpacingValues } from "@reearth/beta/ui/fields/SpacingField";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { LatLng } from "../../Visualizer/Crust/types";
import { CustomSchemaField, FieldValue } from "../types";
import { getYmlJson } from "../utils";

import PropertyItem from "./PropertyItem";

type Props = {
  schemaFields: CustomSchemaField[];
  setSchemaFields: (fields: CustomSchemaField[]) => void;
  selectedPlugin: {
    id: string;
    title: string;
    files: {
      id: string;
      title: string;
      sourceCode: string;
    }[];
  };
  setUpdatedField: ({
    fieldId,
    value
  }: {
    fieldId: string;
    value:
      | boolean
      | LatLng
      | number
      | number[]
      | string
      | string[]
      | SpacingValues;
  }) => void;
};
const ExtensionSettings: FC<Props> = ({
  schemaFields,
  selectedPlugin,
  setUpdatedField
}): JSX.Element => {
  const ymlFile =
    selectedPlugin.files &&
    selectedPlugin.files.find((f) => f.title.endsWith("reearth.yml"));

  if (!ymlFile) {
    return (
      <Wrapper>
        <ErrorMessage>
          This plugin does not have a reearth.yml file.
        </ErrorMessage>
      </Wrapper>
    );
  }

  const getYmlResult = getYmlJson(ymlFile);

  if (!getYmlResult.success) {
    return (
      <Wrapper>
        <ErrorMessage>{getYmlResult.message}</ErrorMessage>
      </Wrapper>
    );
  }

  const ymlJSON = getYmlResult.data;

  if (!ymlJSON || !ymlJSON.extensions) {
    return (
      <Wrapper>
        <ErrorMessage>
          This plugin does not have a valid reearth.yml file.
        </ErrorMessage>
      </Wrapper>
    );
  }
  const widgetExtension = ymlJSON.extensions.find((e) => e.type === "widget");

  if (
    !widgetExtension ||
    !widgetExtension.schema ||
    !widgetExtension.schema.groups
  ) {
    return (
      <Wrapper>
        <ErrorMessage>
          This plugin does not have a valid widget extension.
        </ErrorMessage>
      </Wrapper>
    );
  }

  const widgetSchema = widgetExtension.schema.groups;

  if (!widgetSchema || widgetSchema.length == 0) {
    return (
      <Wrapper>
        <ErrorMessage>This plugin does not have any widgets.</ErrorMessage>
      </Wrapper>
    );
  }

  const { fields } = widgetSchema[0];

  console.log("schemaFields", schemaFields);

  return (
    <Wrapper>
      {fields.map((field) => {
        const initialValue =
          schemaFields &&
          schemaFields.length > 0 &&
          schemaFields.find((f) => f.id === field.id)?.value;
        return (
          <PropertyItem
            field={field}
            initialValue={initialValue as FieldValue}
            key={field.id}
            setUpdatedField={setUpdatedField}
          />
        );
      })}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 10px;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.content.main};
  font-size: ${({ theme }) => theme.fonts.sizes.body}px;
`;

export default ExtensionSettings;
