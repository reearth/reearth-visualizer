import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import type { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";
import useSketchCustomPropertyNames from "../useSketchCustomPropertyNames";

const TextBlock: FC<BlockProps<InfoboxBlock>> = ({
  block,
  layer,
  isSelected,
  ...props
}) => {
  const src = block?.property?.default?.text?.value as ValueTypes["string"];

  const evaluatedSrc = useExpressionEval(src);
  const sketchCustomPropertyNames: string[] | undefined =
    useSketchCustomPropertyNames(layer);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      sketchCustomProperties={sketchCustomPropertyNames}
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
