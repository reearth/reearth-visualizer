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
  const [expression, setExpression] = useState<string>(
    layerStyle?.value?.model?.url?.expression || ""
  );
  const [conditions, setConditions] = useState<Condition[]>(
    layerStyle?.value?.model?.url?.expression?.conditions || []
  );

  return (
    <TextInputNode
      appearanceType="model"
      appearanceTypeKey="url"
      title="Url"
      {...{
        optionsMenu,
        value,
        setValue,
        expression,
        setExpression,
        conditions,
        setConditions,
        layerStyle,
        setLayerStyle
      }}
    />
  );
};

export default UrlNode;
