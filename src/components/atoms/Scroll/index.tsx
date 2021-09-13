import { detect } from "detect-browser";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { styled } from "@reearth/theme";

export type Props = {
  className?: string;
  dragScrollSpead?: number;
  dragScrollZoneHeight?: number;
};

const browser = detect();

const Scroll: React.FC<Props> = ({
  className,
  children,
  dragScrollSpead = 20,
  dragScrollZoneHeight = 1 / 5,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // auto scrolling is already supported by browsers
      if (browser?.name != "safari") return;

      const y = e.clientY;
      const h = e.currentTarget.getBoundingClientRect().height;
      const bottom = y >= h - y;
      const b = h * dragScrollZoneHeight;
      const d = Math.min(b, Math.min(y, h - y));
      const scroll = (1 - d / b) * dragScrollSpead * (bottom ? 1 : -1);

      setScroll(scroll);
    },
    [dragScrollSpead, dragScrollZoneHeight],
  );

  const handleDragLeave = useCallback(() => {
    setScroll(0);
  }, []);

  useEffect(() => {
    if (scroll === 0) return;
    let a: number;
    const cb = () => {
      ref.current?.scrollBy({ top: scroll });
      a = requestAnimationFrame(cb);
    };
    a = window.requestAnimationFrame(cb);
    return () => window.cancelAnimationFrame(a);
  }, [scroll]);

  return (
    <Wrapper
      ref={ref}
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

export default Scroll;
