import Player from "react-player";

import Overlay from "@reearth/beta/components/Overlay";
import { styled } from "@reearth/services/theme";

type Props = {
  isSelected?: boolean;
  src?: string;
  inEditor?: boolean;
};
const VideoPlayer: React.FC<Props> = ({ isSelected, src, inEditor }) => {
  return (
    <StyledWrapper>
      <Overlay show={inEditor} />
      <Player url={src} width="100%" playsinline pip controls light isselected={isSelected} />
    </StyledWrapper>
  );
};

export default VideoPlayer;

const StyledWrapper = styled.div`
  position: relative;
  width: 100%;
`;
