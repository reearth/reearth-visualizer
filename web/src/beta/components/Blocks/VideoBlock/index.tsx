import Player from "react-player";

import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

type Props = {
  url: string;
  controls?: boolean;
  height?: string | number;
};

const VideoBlock: React.FC<Props> = ({ url, controls, height }) => {
  return url ? (
    <Player url={url} controls={controls} width="100%" height={height ?? "auto"} />
  ) : (
    <BlankVideoBox>
      <Icon icon="filmStrip" color="#2e2e2e" size={32} />
    </BlankVideoBox>
  );
};

const BlankVideoBox = styled.div`
  display: flex;
  aspect-ratio: 43/26;
  background: #f1f1f1;
  align-items: center;
  justify-content: center;
`;
export default VideoBlock;
