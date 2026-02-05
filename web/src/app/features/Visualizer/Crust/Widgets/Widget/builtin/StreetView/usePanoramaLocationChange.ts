import { useEffect } from "react";

import { Location } from "./types";

export function usePanoramaLocationChange(
  panorama: google.maps.StreetViewPanorama | null | undefined,
  onChange: (location: Location | null) => void,
  ignoreRef?: React.MutableRefObject<boolean>
) {
  useEffect(() => {
    if (!panorama) return;

    const listener = panorama.addListener("position_changed", () => {
      if (ignoreRef?.current) return;

      const pos = panorama.getPosition();
      if (!pos) return;

      onChange({
        longitude: pos.lng(),
        latitude: pos.lat(),
        height: 2.5
      });
    });

    return () => {
      listener.remove();
    };
  }, [panorama, onChange, ignoreRef]);
}
