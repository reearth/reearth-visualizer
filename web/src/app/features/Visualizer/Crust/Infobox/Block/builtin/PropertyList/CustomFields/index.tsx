import Template from "@reearth/app/features/Visualizer/Crust/StoryPanel/Block/Template";
import { ComputedFeature } from "@reearth/core";
import { FC } from "react";

import { PropertyListItem } from "../ListEditor";
import ListItem from "../ListItem";

import useEvaluateProperties from "./useEvaluateProperties";

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
        evaluatedProperties.map((ep) => (
          <ListItem key={ep.id} keyValue={ep.key} value={ep.value} />
        ))
      ) : (
        <Template icon={extensionId} height={120} />
      )}
    </>
  );
};

export default CustomFields;
