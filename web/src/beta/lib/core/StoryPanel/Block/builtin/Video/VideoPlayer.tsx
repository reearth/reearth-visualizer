import { useContext } from "react";
import Player from "react-player";

import { BlockContext } from "@reearth/beta/lib/core/StoryPanel/Block/builtin/common/Wrapper";

type Props = {
  isSelected?: boolean;
  src?: string;
};
const VideoPlayer: React.FC<Props> = ({ isSelected, src }) => {
  const ctx = useContext(BlockContext);

  return (
    <Player
      url={src}
      width="100%"
      playsinline
      light={!ctx?.editMode}
      pip
      controls
      isselected={isSelected}
    />
  );
};

export default VideoPlayer;
