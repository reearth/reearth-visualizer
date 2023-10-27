import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

type Props = {
  editMode?: boolean;
  isSelected?: boolean;
  setEditMode?: Dispatch<SetStateAction<boolean>>;
  onClickAway?: () => void;
};

export default ({ editMode, isSelected, setEditMode, onClickAway }: Props) => {
  const [showPadding, setShowPadding] = useState(false);

  useEffect(() => {
    if (!isSelected && editMode) {
      setEditMode?.(false);
    }
  }, [isSelected, editMode, setEditMode]);

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
