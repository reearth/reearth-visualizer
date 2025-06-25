import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/app/features/Visualizer/shared/types";
import type { ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const TextBlock: FC<BlockProps<InfoboxBlock>> = ({
  block,
  layer,
  isSelected,
  selectedFeature,
  ...props
}) => {
  const src = block?.property?.default?.text?.value as ValueTypes["string"];

  const evaluatedSrc = useExpressionEval(src);
  const propertyNames = Object.keys(selectedFeature?.properties).filter(
    (key) => {
      const defaultProperty = ["extrudedHeight", "id", "positions", "type"];
      return !defaultProperty.includes(key);
    }
  );
  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      propertyNames={propertyNames}
      {...props}
    >
      {evaluatedSrc !== undefined ? <Text>{evaluatedSrc}</Text> : null}
    </BlockWrapper>
  );
};

export default TextBlock;

const Text = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  minWidth: 0,
  wordWrap: "break-word"
}));
