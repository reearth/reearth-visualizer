import { styled } from "@reearth/services/theme";
import { FC, useEffect, useRef, useState } from "react";
import type ReactPlayer from "react-player";
import Player from "react-player";

type Props = {
  isSelected?: boolean;
  src?: string;
  inEditor?: boolean;
};
const VideoPlayer: FC<Props> = ({ isSelected, src, inEditor }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [aspectRatio, setAspectRatio] = useState(56.25);

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
  }, [src]);

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
