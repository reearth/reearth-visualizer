import { useEffect, useRef, useState } from "react";

export const useElementOnScreen = (options: IntersectionObserverInit) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const elementRef = containerRef.current;
    const observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (elementRef) observer.observe(elementRef);

    return () => {
      if (elementRef) observer.unobserve(elementRef);
    };
  }, [options]);

  return { containerRef, isIntersecting };
};
