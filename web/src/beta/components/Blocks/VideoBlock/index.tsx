import { CSSProperties, FC } from "react";
import Player from "react-player";

type Props = {
  url: string;
  maxHeight?: CSSProperties["maxHeight"];
  controls?: boolean;
};

const VideoBlock: FC<Props> = ({ url, maxHeight, controls }) => {
  return <Player url={url} controls={controls} maxHeight={maxHeight} />;
};

export default VideoBlock;
