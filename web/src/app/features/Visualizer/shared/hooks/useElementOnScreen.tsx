import { useCallback, useEffect, useRef, useState } from "react";

export const useElementOnScreen = (options: IntersectionObserverInit) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  
  // Memoize the callback to prevent observer recreation
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
    setIntersectionRatio(entry.intersectionRatio);
  }, []);

  useEffect(() => {
    const elementRef = containerRef.current;
    if (!elementRef) return;

    const observer = new IntersectionObserver(handleIntersection, options);
    observer.observe(elementRef);

    return () => {
      observer.unobserve(elementRef);
      observer.disconnect();
    };
  }, [handleIntersection, options]);

  return { 
    containerRef, 
    isIntersecting, 
    intersectionRatio 
  };
};
