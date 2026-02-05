import useVideoAspectRatio from "@reearth/app/features/Visualizer/hooks/useVideoAspectRatio";
import { styled } from "@reearth/services/theme";
import { FC } from "react";
import Player from "react-player";

type Props = {
  isSelected?: boolean;
  src?: string;
  inEditor?: boolean;
};
const VideoPlayer: FC<Props> = ({ isSelected, src, inEditor }) => {
  const { playerRef, aspectRatio } = useVideoAspectRatio({ src });

  return (
    <Wrapper aspectRatio={aspectRatio} test-id="video-player">
      {inEditor && <Overlay />}
      <StyledPlayer
        ref={playerRef}
        url={src}
        width="100%"
        height="100%"
        playsinline
        pip
        controls
        light
        isselected={isSelected}
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
  );
};

export default VideoPlayer;

const Wrapper = styled("div")<{ aspectRatio: number }>`
  position: relative;
  padding-top: ${({ aspectRatio }) => `${aspectRatio}%`};
  width: 100%;
`;

const Overlay = styled("div")(() => ({
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0
}));

const StyledPlayer = styled(Player)({
  position: "absolute",
  top: 0,
  left: 0
});
