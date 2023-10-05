import { useEffect, useRef } from "react";

export const useScroll = () => {
  const scrollContainerRef = useRef<null | HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const mouseY = e.clientY;
    const scrollThreshold = scrollContainer.offsetHeight * 0.4;
    mouseY < scrollThreshold
      ? (scrollContainer.scrollTop -= 10)
      : mouseY > scrollContainer.offsetHeight - scrollThreshold &&
        (scrollContainer.scrollTop += 10);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return { scrollContainerRef } as const;
};
