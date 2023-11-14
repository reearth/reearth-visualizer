import { useCallback, useRef } from "react";

const useDoubleClick = (
  onClick: (() => void) | undefined,
  onDoubleClick: (() => void) | undefined,
  delay = 200,
): [() => void, () => void] => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const singleClickHandler = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    } else if (onClick) {
      timerRef.current = setTimeout(() => {
        onClick();
        timerRef.current = null;
      }, delay);
    }
  }, [onClick, delay]);

  const doubleClickHandler = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onDoubleClick?.();
  }, [onDoubleClick]);

  return [singleClickHandler, doubleClickHandler];
};

export default useDoubleClick;
