import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps } from "@reearth/app/features/Visualizer/shared/types";
import { ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import type ReactPlayer from "react-player";
import Player from "react-player";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const VideoBlock: FC<CommonBlockProps<InfoboxBlock>> = ({
  block,
  layer,
  isSelected,
  selectedFeature,
  ...props
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [aspectRatio, setAspectRatio] = useState(56.25);

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

  useEffect(() => {
    const player =
      playerRef.current?.getInternalPlayer() as HTMLVideoElement | null;
    if (!player) return;

    const handleMeta = () => {
      const w = player.videoWidth;
      const h = player.videoHeight;
      console.log("video meta loaded", w, h);
      if (w && h) setAspectRatio((h / w) * 100);
    };

    handleMeta();
    player.addEventListener("loadedmetadata", handleMeta);

    return () => player.removeEventListener("loadedmetadata", handleMeta);
  }, [evaluatedSrc]);

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
      {evaluatedSrc !== undefined ? (
        <Wrapper aspectRatio={aspectRatio}>
          <StyledPlayer
            ref={playerRef}
            url={evaluatedSrc}
            width="100%"
            height="100%"
            playsinline
            pip
            controls
            light
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload",
                  preload: "metadata",
                  onContextMenu: (e: React.SyntheticEvent) => e.preventDefault()
                }
              }
            }}
          />
        </Wrapper>
      ) : null}
    </BlockWrapper>
  );
};

export default VideoBlock;

const Wrapper = styled("div")<{ aspectRatio: number }>`
  position: relative;
  padding-top: ${({ aspectRatio }) => `${aspectRatio}%`};
  width: 100%;
`;

const StyledPlayer = styled(Player)({
  position: "absolute",
  top: 0,
  left: 0
});
