import { useState, useEffect, useMemo, useRef } from "react";

export const useImage = (src?: string): HTMLImageElement | undefined => {
  const imgRef = useRef<HTMLImageElement>();
  const [img, setImg] = useState<HTMLImageElement>();

  useEffect(() => {
    if (!src) {
      setImg(undefined);
      if (imgRef.current) {
        imgRef.current.src = "";
      }
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImg(imgRef.current);
    };
    img.src = src;
    imgRef.current = img;
  }, [src]);

  return img;
};

export const useCanvas = (cb: (canvas: HTMLCanvasElement) => void): string => {
  const can = useMemo(() => document.createElement("canvas"), []);
  const [data, setData] = useState<string>("");
  useEffect(() => {
    cb(can);
    setData(can.toDataURL());
  }, [can, cb]);
  return data;
};
