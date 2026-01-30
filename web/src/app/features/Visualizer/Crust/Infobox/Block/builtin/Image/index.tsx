import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/app/features/Visualizer/shared/types";
import type { ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useMemo } from "react";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const ImageBlock: FC<BlockProps<InfoboxBlock>> = ({
  block,
  layer,
  isSelected,
  selectedFeature,
  ...props
}) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src]
  );

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
      {evaluatedSrc !== undefined ? <Image src={evaluatedSrc} /> : null}
    </BlockWrapper>
  );
};

export default ImageBlock;

const Image = styled("img")(() => ({
  width: "100%",
  height: "100%",
  objectFit: css.objectFit.contain,
  objectPosition: "center"
}));
