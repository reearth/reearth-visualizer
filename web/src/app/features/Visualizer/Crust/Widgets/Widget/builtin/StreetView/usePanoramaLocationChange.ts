import { useEffect, useRef } from "react";

import { STREET_VIEW_HEIGHT } from "./constant";
import { Location } from "./types";

export function usePanoramaLocationChange(
  panorama: google.maps.StreetViewPanorama | null | undefined,
  onChange: (location: Location | null) => void
) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!panorama) return;

    const listener = panorama.addListener("position_changed", () => {
      const pos = panorama.getPosition();
      if (!pos) return;

      onChangeRef.current({
        longitude: pos.lng(),
        latitude: pos.lat(),
        height: STREET_VIEW_HEIGHT
      });
    });

    return () => {
      listener.remove();
    };
  }, [panorama]);
}
