import { useState, useCallback } from "react";

export default (onBlockInsert?: (bi: number, i: number, p?: "top" | "bottom") => void) => {
  const [insertionPopUpPosition, setInsertionPopUpPosition] = useState<
    [number, "top" | "bottom" | undefined]
  >();

  const onInsertionButtonClick = useCallback((i: number, p?: "top" | "bottom") => {
    setInsertionPopUpPosition(p ? [i, p] : [i, undefined]);
  }, []);

  const onInsertionPopUpClose = useCallback(() => {
    setInsertionPopUpPosition(undefined);
  }, []);

  const handleBlockInsert = useCallback(
    (bi: number) => {
      if (insertionPopUpPosition) {
        onBlockInsert?.(bi, insertionPopUpPosition[0], insertionPopUpPosition[1]);
        onInsertionPopUpClose();
      }
    },
    [insertionPopUpPosition, onBlockInsert, onInsertionPopUpClose],
  );

  return {
    insertionPopUpPosition,
    onInsertionButtonClick,
    onInsertionPopUpClose,
    handleBlockInsert,
  };
};
