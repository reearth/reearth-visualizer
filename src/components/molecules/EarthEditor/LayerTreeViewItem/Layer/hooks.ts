import React, { useState, useEffect, useCallback } from "react";

export default function ({
  group,
  visible,
  visibilityChangeable,
  onExpand,
  onVisibilityChange,
}: {
  group?: boolean;
  visible?: boolean;
  visibilityChangeable?: boolean;
  onExpand?: () => void;
  onVisibilityChange?: (visible: boolean) => void;
}) {
  const [isHover, toggleHover] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const mouseEnterSec = 1100;

  const handleVisibilityChange = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!visibilityChangeable) return;
      event.stopPropagation();
      onVisibilityChange?.(!visible);
    },
    [visible, onVisibilityChange, visibilityChangeable],
  );

  const handleExpand = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!group) return;
      e.stopPropagation();
      onExpand?.();
    },
    [onExpand, group],
  );

  useEffect(() => {
    if (isHover) {
      const timer = setTimeout(() => {
        setShowHelp(true);
      }, mouseEnterSec);
      return () => clearTimeout(timer);
    }
    setShowHelp(false);
    return;
  }, [isHover]);

  return {
    isHover,
    showHelp,
    toggleHover,
    handleVisibilityChange,
    handleExpand,
  };
}
