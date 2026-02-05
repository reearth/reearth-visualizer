import { useEffect } from "react";

import { HeadingPitch } from "./types";

export function usePanoramaHeadingPitchChange(
  panorama: google.maps.StreetViewPanorama | null | undefined,
  onChange: (hp: HeadingPitch) => void
) {
  useEffect(() => {
    if (!panorama) return;

    const listener = panorama.addListener("pov_changed", () => {
      const pov = panorama.getPov();
      onChange({ heading: pov.heading, pitch: pov.pitch });
    });

    return () => {
      listener.remove();
    };
  }, [panorama, onChange]);
}
