import { FC, useMemo } from "react";
import Player from "react-player";

import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { ValueTypes } from "@reearth/beta/utils/value";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const VideoBlock: FC<CommonBlockProps<InfoboxBlock>> = ({ block, isSelected, ...props }) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src],
  );

  const evaluatedSrc = useExpressionEval(src);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}>
      {evaluatedSrc !== undefined ? (
        <Player url={evaluatedSrc} width="100%" playsinline pip controls light height={180} />
      ) : null}
    </BlockWrapper>
  );
};

export default VideoBlock;
