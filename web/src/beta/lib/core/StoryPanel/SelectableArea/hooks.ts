import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Props = {
  editMode?: boolean;
  isSelected?: boolean;
  property?: any;
  setEditMode?: Dispatch<SetStateAction<boolean>>;
  onClickAway?: () => void;
};

export default ({ editMode, isSelected, property, setEditMode, onClickAway }: Props) => {
  const [isHovered, setHover] = useState(false);
  const [showPadding, setShowPadding] = useState(false);

  useEffect(() => {
    if (!isSelected && editMode) {
      setEditMode?.(false);
    }
  }, [isSelected, editMode, setEditMode]);

  const handleMouseOver = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setHover(true);
  }, []);

  const handleMouseOut = useCallback(() => setHover(false), []);

  const handleClickAway = useCallback(() => {
    setShowPadding(false);
    onClickAway?.();
  }, [onClickAway]);

  const panelSettings = useMemo(() => {
    return property?.panel;
  }, [property?.panel]);

  return {
    isHovered,
    showPadding,
    panelSettings,
    setShowPadding,
    handleMouseOver,
    handleMouseOut,
    handleClickAway,
  };
};
