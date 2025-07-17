import { styled } from "@reearth/services/theme";
import { FC } from "react";
import Player from "react-player";

type Props = {
  isSelected?: boolean;
  src?: string;
  inEditor?: boolean;
};
const VideoPlayer: FC<Props> = ({ isSelected, src, inEditor }) => {
  return (
    <StyledWrapper>
      {inEditor && <Overlay />}
      <Player
        url={src}
        width="100%"
        playsinline
        pip
        controls
        light
        isselected={isSelected}
      />
    </StyledWrapper>
  );
};

export default VideoPlayer;

const StyledWrapper = styled("div")({
  width: "100%",
  position: "relative"
});

const Overlay = styled("div")({
  width: "100%",
  height: "100%",
  position: "absolute"
});
