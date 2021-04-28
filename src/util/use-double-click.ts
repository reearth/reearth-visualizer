import { useCallback, useRef } from "react";

const useDoubleClick = (
  onClick: () => void,
  onDoubleClick: (() => void) | undefined,
): [() => void, () => void] => {
  const t = useRef<NodeJS.Timeout>();

  const handleClick = useCallback(() => {
    t.current && clearTimeout(t.current);
    t.current = setTimeout(onClick, 200);
  }, [onClick]);

  const handleDoubleClick = useCallback(() => {
    t.current && clearTimeout(t.current);
    onDoubleClick?.();
  }, [onDoubleClick]);

  return [handleClick, handleDoubleClick];
};

export default useDoubleClick;
