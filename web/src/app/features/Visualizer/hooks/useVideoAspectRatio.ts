import { useEffect, useRef, useState } from "react";
import type ReactPlayer from "react-player";

export default ({ src }: { src: string | undefined }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [aspectRatio, setAspectRatio] = useState(56.25);

  useEffect(() => {
    const player =
      playerRef.current?.getInternalPlayer() as HTMLVideoElement | null;
    if (!player) return;

    const handleMeta = () => {
      const w = player.videoWidth;
      const h = player.videoHeight;
      if (w && h) setAspectRatio((h / w) * 100);
    };

    handleMeta();
    player.addEventListener("loadedmetadata", handleMeta);

    return () => player.removeEventListener("loadedmetadata", handleMeta);
  }, [src]);

  return {
    playerRef,
    aspectRatio
  };
};
