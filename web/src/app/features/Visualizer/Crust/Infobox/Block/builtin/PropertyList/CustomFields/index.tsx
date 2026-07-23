import Template from "@reearth/app/features/Visualizer/Crust/StoryPanel/Block/Template";
import { ComputedFeature } from "@reearth/core";
import { FC } from "react";

import { PropertyListItem } from "../ListEditor";
import ListItem from "../ListItem";

import useEvaluateProperties from "./useEvaluateProperties";

function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(toDisplayString).join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[object]";
    }
  }
  return String(value);
}

type Props = {
  extensionId?: string;
  selectedFeature?: ComputedFeature;
  properties?: PropertyListItem[];
};

const CustomFields: FC<Props> = ({
  extensionId,
  properties,
  selectedFeature
}) => {
  const evaluatedProperties = useEvaluateProperties({
    selectedFeature,
    properties
  });

  return (
    <>
      {evaluatedProperties && evaluatedProperties.length > 0 ? (
        evaluatedProperties.map((ep, idx) => (
          <ListItem
            key={ep.id}
            index={idx}
            keyValue={ep.key}
            value={toDisplayString(ep.value)}
          />
        ))
      ) : (
        <Template icon={extensionId} height={120} />
      )}
    </>
  );
};

export default CustomFields;
