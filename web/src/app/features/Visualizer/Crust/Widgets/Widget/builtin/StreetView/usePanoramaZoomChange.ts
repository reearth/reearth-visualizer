import { useEffect } from "react";

export function usePanoramaZoomChange(
  panorama: google.maps.StreetViewPanorama | null | undefined,
  onChange: (zoom: number) => void
) {
  useEffect(() => {
    if (!panorama) return;

    const listener = panorama.addListener("zoom_changed", () => {
      onChange(panorama.getZoom());
    });

    return () => {
      listener.remove();
    };
  }, [panorama, onChange]);
}
