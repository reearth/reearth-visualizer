import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EditModeContextType } from "../../shared/contexts/editModeContext";

import { Infobox } from "./types";

export default ({
  infobox,
  isEditable,
  onBlockCreate,
  onBlockMove
}: {
  infobox?: Infobox;
  isEditable?: boolean;
  onBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined
  ) => Promise<void>;
  onBlockMove?: (id: string, targetIndex: number, blockId?: string) => void;
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [disableSelection, setDisableSelection] = useState(false);

  const [infoboxBlocks, setInfoboxBlocks] = useState(infobox?.blocks ?? []);
  const [selectedBlockId, setSelectedBlockId] = useState<string>();
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();
  const [isDragging, setIsDragging] = useState(false);

  // Will only be undefined when infobox is first created, so default to true
  const showInfobox = useMemo(
    () =>
      infobox
        ? infobox?.property?.default?.enabled?.value === undefined
          ? true
          : !!infobox.property.default.enabled.value
        : false,
    [infobox]
  );

  const paddingField = useMemo(
    () => infobox?.property?.default?.padding,
    [infobox?.property?.default?.padding]
  );

  const gapField = useMemo(
    () => infobox?.property?.default?.gap,
    [infobox?.property?.default?.gap]
  );

  const positionField = useMemo(
    () => infobox?.property?.default?.position,
    [infobox?.property?.default?.position]
  );

  const handleBlockOpen = useCallback(
    (index: number) => {
      if (openBlocksIndex === index) {
        setOpenBlocksIndex(undefined);
      } else {
        setOpenBlocksIndex(index);
      }
    },
    [openBlocksIndex]
  );

  const handleSelectionDisable = useCallback(
    (disabled?: boolean) => setDisableSelection(!!disabled),
    []
  );

  const handleBlockCreate = useCallback(
    (index: number) =>
      async (
        extensionId?: string | undefined,
        pluginId?: string | undefined
      ) => {
        if (!extensionId || !pluginId) return;
        await onBlockCreate?.(pluginId, extensionId, index);
      },
    [onBlockCreate]
  );

  const handleBlockSelect = useCallback(
    (blockId?: string) => {
      if (!isEditable || blockId === selectedBlockId || disableSelection)
        return;
      setSelectedBlockId(blockId);
    },
    [selectedBlockId, isEditable, disableSelection]
  );

  const handleBlockDoubleClick = useCallback(
    (blockId?: string) => {
      if (disableSelection) return;
      setSelectedBlockId(blockId);
    },
    [disableSelection]
  );

  const editModeContext: EditModeContextType = useMemo(
    () => ({
      disableSelection,
      onSelectionDisable: handleSelectionDisable
    }),
    [disableSelection, handleSelectionDisable]
  );

  useEffect(() => {
    if (infobox) {
      setInfoboxBlocks(
        infobox.blocks && infobox.blocks.length > 0 ? infobox.blocks : []
      );
    } else {
      setInfoboxBlocks([]);
      setSelectedBlockId(undefined);
      setOpenBlocksIndex(undefined);
      setDisableSelection(false);
    }
  }, [infobox]);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [infobox?.featureId]);

  const handleMoveEnd = useCallback(
    async (itemId?: string, newIndex?: number) => {
      if (itemId !== undefined && newIndex !== undefined) {
        setInfoboxBlocks((old) => {
          const items = [...old];
          const currentIndex = old.findIndex((o) => o.id === itemId);
          if (currentIndex !== -1) {
            const [movedItem] = items.splice(currentIndex, 1);
            items.splice(newIndex, 0, movedItem);
          }
          return items;
        });
        await onBlockMove?.(itemId, newIndex);
      }
      setIsDragging(false);
    },
    [onBlockMove]
  );

  return {
    wrapperRef,
    disableSelection,
    infoboxBlocks,
    selectedBlockId,
    openBlocksIndex,
    showInfobox,
    paddingField,
    gapField,
    positionField,
    editModeContext,
    isDragging,
    setInfoboxBlocks,
    handleBlockOpen,
    handleBlockCreate,
    handleBlockSelect,
    handleBlockDoubleClick,
    handleMoveEnd
  };
};
