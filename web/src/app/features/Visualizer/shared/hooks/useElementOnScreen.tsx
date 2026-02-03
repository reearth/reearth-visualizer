import { useEffect, useState, RefObject } from "react";

interface UseElementOnScreenProps {
  wrapperRef: RefObject<HTMLElement | null>;
  elementRef: RefObject<HTMLElement | null>;
  threshold?: number; // Default 0.5 (50% of wrapper height)
  resetKey?: string | number; // Optional key to force reset of observers
}

export const useElementOnScreen = ({
  wrapperRef,
  elementRef,
  threshold = 0.5,
  resetKey
}: UseElementOnScreenProps) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const element = elementRef.current;

    if (!wrapper || !element) return;

    const checkVisibility = () => {
      const wrapperRect = wrapper.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Calculate the visible portion of the element within the wrapper
      const visibleTop = Math.max(elementRect.top, wrapperRect.top);
      const visibleBottom = Math.min(elementRect.bottom, wrapperRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      // Check if visible height is more than threshold of wrapper height
      const wrapperHeight = wrapperRect.height;
      const isVisible = visibleHeight >= wrapperHeight * threshold;

      setIsActive(isVisible);
    };

    // Check immediately
    checkVisibility();

    // Check on scroll
    wrapper.addEventListener("scroll", checkVisibility, { passive: true });

    // Check on resize (wrapper or element size changes)
    const resizeObserver = new ResizeObserver(checkVisibility);
    resizeObserver.observe(wrapper);
    resizeObserver.observe(element);

    return () => {
      wrapper.removeEventListener("scroll", checkVisibility);
      resizeObserver.disconnect();
    };
  }, [wrapperRef, elementRef, threshold, resetKey]);

  return isActive;
};
