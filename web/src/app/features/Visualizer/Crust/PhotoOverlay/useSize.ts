import { PhotoOverlayValue } from "@reearth/app/utils/sketch";
import { useEffect, useRef, useState } from "react";

export default ({ value }: { value: PhotoOverlayValue | undefined }) => {
  const [sizeBase, setSizeBase] = useState<"width" | "height">("width");
  const [heightPct, setHeightPct] = useState<number | undefined>(1);
  const [photoSize, setPhotoSize] = useState<
    { width: number; height: number } | undefined
  >(undefined);

  const photoWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const photoWrapperElement = photoWrapperRef.current;
    if (!photoWrapperElement) return;

    const checkAspectRatio = () => {
      setSizeBase(
        photoWrapperElement.clientWidth >= photoWrapperElement.clientHeight
          ? "width"
          : "height"
      );
    };

    checkAspectRatio();

    const resizeObserver = new ResizeObserver(checkAspectRatio);
    resizeObserver.observe(photoWrapperElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [value]);

  useEffect(() => {
    if (
      photoSize?.width &&
      photoSize?.height &&
      value?.fill === "fixed" &&
      value?.widthPct !== undefined
    ) {
      const fixedHeightPct =
        photoSize.height / (photoSize.width / value?.widthPct);
      setHeightPct(fixedHeightPct);
    }
  }, [photoSize, value?.fill, value?.widthPct]);

  return {
    sizeBase,
    photoWrapperRef,
    heightPct,
    setPhotoSize
  };
};
