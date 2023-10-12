import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

import type { Item } from "@reearth/services/api/propertyApi/utils";

type Props = {
  editMode?: boolean;
  isSelected?: boolean;
  propertyItems?: Item[];
  setEditMode?: Dispatch<SetStateAction<boolean>>;
  onClickAway?: () => void;
};

export default ({ editMode, isSelected, propertyItems, setEditMode, onClickAway }: Props) => {
  const [showPadding, setShowPadding] = useState(false);

  const panelSettings: Item | undefined = useMemo(
    () => propertyItems?.find(i => i.schemaGroup === "panel"),
    [propertyItems],
  );

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
    panelSettings,
    setShowPadding,
    handleClickAway,
  };
};
