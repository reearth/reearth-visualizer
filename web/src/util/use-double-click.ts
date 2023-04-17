import { useCallback, useRef } from "react";

const useDoubleClick = (
  onClick: (() => void) | undefined,
  onDoubleClick: (() => void) | undefined,
): [() => void, () => void] => {
  const t = useRef<NodeJS.Timeout>();

  const handleClick = useCallback(() => {
    if (t.current) clearTimeout(t.current);
    if (onClick) {
      t.current = setTimeout(onClick, 200);
    }
  }, [onClick]);

  const handleDoubleClick = useCallback(() => {
    if (t.current) clearTimeout(t.current);
    onDoubleClick?.();
  }, [onDoubleClick]);

  return [handleClick, handleDoubleClick];
};

export default useDoubleClick;
