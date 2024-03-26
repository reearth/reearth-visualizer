import Template from "@reearth/beta/lib/core/StoryPanel/Block/Template";

import { PropertyListItem } from "../ListEditor";
import ListItem from "../ListItem";

import useEvaluateProperties from "./useEvaluateProperties";

type Props = {
  extensionId?: string;
  properties?: PropertyListItem[];
};

const CustomFields: React.FC<Props> = ({ extensionId, properties }) => {
  const evaluatedProperties = useEvaluateProperties(properties);

  return (
    <>
      {evaluatedProperties && evaluatedProperties.length > 0 ? (
        evaluatedProperties.map(ep => <ListItem key={ep.id} keyValue={ep.key} value={ep.value} />)
      ) : (
        <Template icon={extensionId} height={120} />
      )}
    </>
  );
};

export default CustomFields;
