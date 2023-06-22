import { CSSProperties, FC } from "react";
import Player from "react-player";

import { styled } from "@reearth/services/theme";

type Props = {
  url: string;
  maxHeight?: CSSProperties["maxHeight"];
  controls?: boolean;
};

const VideoBlock: FC<Props> = ({ url, maxHeight, controls }) => {
  return (
    <Wrapper maxHeight={maxHeight}>
      <Player url={url} controls={controls} height={"100%"} />
    </Wrapper>
  );
};
const Wrapper = styled.div<{ maxHeight: CSSProperties["maxHeight"] }>`
  display: flex;
  height: ${props => (props.maxHeight ? props.maxHeight : "100%")};
`;
export default VideoBlock;
