import { ModelAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import TextInputNode, {
  DEFAULT_TEXT_VALUE
} from "../../common/fieldInputNode/TextInputNode";
import { Condition } from "../../common/type";

const UrlNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<ModelAppearance["url"]>(
    layerStyle?.value?.model?.url ?? DEFAULT_TEXT_VALUE
  );
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <TextInputNode
      appearanceType="model"
      appearanceTypeKey="url"
      title="Url"
      optionsMenu={optionsMenu}
      layerStyle={layerStyle}
      setLayerStyle={setLayerStyle}
      value={value}
      setValue={setValue}
      expression={expression}
      setExpression={setExpression}
      conditions={conditions}
      setConditions={setConditions}
    />
  );
};

export default UrlNode;
