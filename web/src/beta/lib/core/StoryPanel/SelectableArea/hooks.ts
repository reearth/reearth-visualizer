import { useCallback, useEffect, useState } from "react";

type Props = {
  editMode?: boolean;
  isSelected?: boolean;
  onEditModeToggle?: (enable: boolean) => void;
  onClickAway?: () => void;
};

export default ({ editMode, isSelected, onEditModeToggle, onClickAway }: Props) => {
  const [showPadding, setShowPadding] = useState(false);

  useEffect(() => {
    if (!isSelected && editMode) {
      onEditModeToggle?.(false);
    }
  }, [isSelected, editMode, onEditModeToggle]);

  const handleClickAway = useCallback(() => {
    setShowPadding(false);
    onClickAway?.();
  }, [onClickAway]);

  return {
    showPadding,
    setShowPadding,
    handleClickAway,
  };
};
