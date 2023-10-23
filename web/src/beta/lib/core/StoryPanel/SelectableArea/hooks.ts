import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  editMode?: boolean;
  isSelected?: boolean;
  property?: any;
  setEditMode?: Dispatch<SetStateAction<boolean>>;
  onClickAway?: () => void;
};

export default ({ editMode, isSelected, property, setEditMode, onClickAway }: Props) => {
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

  const panelSettings = useMemo(() => {
    return property?.panel;
  }, [property?.panel]);

  return {
    showPadding,
    panelSettings,
    setShowPadding,
    handleClickAway,
  };
};
