import { useEffect, useRef } from "react";

export function useWindowEvent<K extends keyof WindowEventMap>(
  eventName: K,
  callback: (event: WindowEventMap[K]) => void,
  options?: EventListenerOptions,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const optionsRef = useRef(options);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const listener = (event: WindowEventMap[K]): void => {
      callbackRef.current?.(event);
    };
    const options = optionsRef.current;
    window.addEventListener(eventName, listener, options);
    return () => {
      window.removeEventListener(eventName, listener, options);
    };
  }, [eventName]);
}
