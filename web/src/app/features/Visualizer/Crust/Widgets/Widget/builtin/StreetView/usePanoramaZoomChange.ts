import { useEffect, useRef } from "react";

export function usePanoramaZoomChange(
  panorama: google.maps.StreetViewPanorama | null | undefined,
  onChange: (zoom: number) => void
) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!panorama) return;

    const listener = panorama.addListener("zoom_changed", () => {
      const zoom = panorama.getZoom();
      if (zoom == null) return;

      onChangeRef.current(zoom);
    });

    return () => {
      listener.remove();
    };
  }, [panorama]);
}
