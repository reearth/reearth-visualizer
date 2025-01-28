import { useNotification } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { getYmlJson } from "../utils";

import PropertyItem from "./PropertyItem";

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
  const [, setNotification] = useNotification();
  const ymlFile =
    selectedPlugin.files &&
    selectedPlugin.files.find((f) => f.title.endsWith("reearth.yml"));

  if (!ymlFile) return <div />;

  const getYmlResult = getYmlJson(ymlFile);

  if (!getYmlResult.success) {
    setNotification({ type: "error", text: getYmlResult.message });
    return <div />;
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

  const { fields } = widgetSchema[0];
  return (
    <Wrapper>
      {fields.map((field) => (
        <PropertyItem field={field} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 10px;
`;

export default WidgetsList;
