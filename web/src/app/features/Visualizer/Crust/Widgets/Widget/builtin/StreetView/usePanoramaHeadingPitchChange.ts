import { useEffect, useRef } from "react";

import { HeadingPitch } from "./types";

export function usePanoramaHeadingPitchChange(
  panorama: google.maps.StreetViewPanorama | null | undefined,
  onChange: (hp: HeadingPitch) => void
) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!panorama) return;

    const listener = panorama.addListener("pov_changed", () => {
      const pov = panorama.getPov();

      onChangeRef.current({
        heading: pov.heading,
        pitch: pov.pitch
      });
    });

    return () => {
      listener.remove();
    };
  }, [panorama]);
}
