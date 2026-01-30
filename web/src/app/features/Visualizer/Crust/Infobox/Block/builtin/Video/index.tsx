import useVideoAspectRatio from "@reearth/app/features/Visualizer/hooks/useVideoAspectRatio";
import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps } from "@reearth/app/features/Visualizer/shared/types";
import { ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useMemo } from "react";
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

  const { playerRef, aspectRatio } = useVideoAspectRatio({ src: evaluatedSrc });

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
  position: css.position.absolute,
  top: 0,
  left: 0
});
