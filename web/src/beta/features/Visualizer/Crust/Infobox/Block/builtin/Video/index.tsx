import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";
import type ReactPlayer from "react-player";
import Player from "react-player";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const VideoBlock: FC<CommonBlockProps<InfoboxBlock>> = ({
  block,
  isSelected,
  ...props
}) => {
  const [aspectRatio, setAspectRatio] = useState(56.25);

  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src]
  );

  const evaluatedSrc = useExpressionEval(src);

  const handleVideoReady = useCallback((player: ReactPlayer) => {
    const height = player.getInternalPlayer().videoHeight;
    const width = player.getInternalPlayer().videoWidth;
    if (!height || !width) return;
    setAspectRatio((height / width) * 100);
  }, []);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}
    >
      {evaluatedSrc !== undefined ? (
        <Wrapper aspectRatio={aspectRatio}>
          <StyledPlayer
            url={evaluatedSrc}
            width="100%"
            height="100%"
            onReady={handleVideoReady}
            playsinline
            pip
            controls
            light
          />
        </Wrapper>
      ) : null}
    </BlockWrapper>
  );
};

export default VideoBlock;

const Wrapper = styled("div")<{ aspectRatio: number }>(({ aspectRatio }) => ({
  position: "relative",
  paddingTop: `${aspectRatio}%`,
  width: "100%"
}));

const StyledPlayer = styled(Player)({
  position: "absolute",
  top: 0,
  left: 0
});
