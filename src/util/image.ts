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

export const useCanvas = (cb: (canvas: HTMLCanvasElement) => void) => {
  const canvas1 = useMemo(() => document.createElement("canvas"), []);
  const canvas2 = useMemo(() => document.createElement("canvas"), []);
  const [canvas, setCanvas] = useState(canvas1);
  useEffect(() => {
    const can = canvas === canvas2 ? canvas1 : canvas2;
    cb(can);
    setCanvas(can);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas1, canvas2, cb]); // ignore canvas
  return canvas;
};
