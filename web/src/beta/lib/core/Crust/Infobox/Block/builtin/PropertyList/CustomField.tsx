import useExpressionEval from "../useExpressionEval";

import { type PropertyListItem } from "./ListEditor";
import ListItem from "./ListItem";

const CustomField: React.FC<{ index?: number; field?: PropertyListItem }> = ({ index, field }) => {
  const evaluatedSrc = useExpressionEval(field?.value);
  return <ListItem index={index} keyValue={field?.key} value={evaluatedSrc} />;
};

export default CustomField;
