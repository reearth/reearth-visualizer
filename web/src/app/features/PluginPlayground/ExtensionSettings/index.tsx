import { Collapse } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

import { FileType } from "../Plugins/constants";
import { FieldValue } from "../types";
import { getYmlJson } from "../utils";

import PropertyItem from "./PropertyItem";

type Props = {
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
const ExtensionSettings: FC<Props> = ({
  selectedPlugin,
  selectedFile,
  fieldValues,
  setFieldValues
}): ReactNode => {
  const t = useT();

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
          {t("This plugin does not have a valid reearth.yml file.")}
        </ErrorMessage>
      </Wrapper>
    );
  }

  const extension = ymlJSON.extensions.find(
    (e) => e.id === selectedFile.title.split(".")[0]
  );

  const handleFieldValueChange = (fieldId: string, value: FieldValue) => {
    setFieldValues({ ...fieldValues, [fieldId]: value });
  };

  return extension?.schema?.groups && extension.schema.groups.length > 0 ? (
    <Wrapper>
      {extension.schema.groups.map((group) => (
        <Collapse title={group.title} key={group.id}>
          <FieldsWrapper>
            {group.fields.map((field) => {
              const id = `${ymlJSON.id}-${extension.id}-${group.id}-${field.id}`;
              const value = fieldValues[id];
              return (
                <PropertyItem
                  id={id}
                  field={field}
                  value={value}
                  key={field.id}
                  onUpdate={handleFieldValueChange}
                />
              );
            })}
          </FieldsWrapper>
        </Collapse>
      ))}
    </Wrapper>
  ) : (
    <Wrapper>
      <ErrorMessage>{t("No valid schema defined.")}</ErrorMessage>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.small
}));

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal
}));

const ErrorMessage = styled.p(({ theme }) => ({
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.body
}));

export default ExtensionSettings;
