import Player from "react-player";

import { styled } from "@reearth/services/theme";

type Props = {
  isSelected?: boolean;
  src?: string;
  isInEditor?: boolean;
};
const VideoPlayer: React.FC<Props> = ({ isSelected, src, isInEditor }) => {
  return (
    <StyledWrapper>
      {isInEditor && <Overlay />}
      <Player url={src} width="100%" playsinline pip controls light isselected={isSelected} />
    </StyledWrapper>
  );
};

export default VideoPlayer;

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;
