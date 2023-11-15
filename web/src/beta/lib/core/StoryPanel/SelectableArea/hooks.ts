import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Props = {
  editMode?: boolean;
  isSelected?: boolean;
  setEditMode?: Dispatch<SetStateAction<boolean>>;
};

export default ({ editMode, isSelected, setEditMode }: Props) => {
  const [showPadding, setShowPadding] = useState(false);

  useEffect(() => {
    if (!isSelected && editMode) {
      setEditMode?.(false);
    }
  }, [isSelected, editMode, setEditMode]);

  return {
    showPadding,
    setShowPadding,
  };
};
