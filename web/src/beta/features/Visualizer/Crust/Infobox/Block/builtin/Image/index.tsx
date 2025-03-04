import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import type { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";
import useSketchCustomPropertyNames from "../useSketchCustomPropertyNames";

const ImageBlock: FC<BlockProps<InfoboxBlock>> = ({
  block,
  layer,
  isSelected,
  ...props
}) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src]
  );

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
      {evaluatedSrc !== undefined ? <Image src={evaluatedSrc} /> : null}
    </BlockWrapper>
  );
};

export default ImageBlock;

const Image = styled("img")(() => ({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center"
}));
