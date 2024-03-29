import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { EditModeContext } from "@reearth/beta/lib/core/shared/contexts/editModeContext";

import { Infobox } from "./types";

export default ({
  infobox,
  isEditable,
  onBlockCreate,
}: {
  infobox?: Infobox;
  isEditable?: boolean;
  onBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined,
  ) => Promise<void>;
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [disableSelection, setDisableSelection] = useState(false);

  const [infoboxBlocks, setInfoboxBlocks] = useState(infobox?.blocks ?? []);
  const [selectedBlockId, setSelectedBlockId] = useState<string>();
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

  // Will only be undefined when infobox is first created, so default to true
  const showInfobox = useMemo(
    () =>
      infobox
        ? infobox?.property?.default?.enabled?.value === undefined
          ? true
          : !!infobox.property.default.enabled.value
        : false,
    [infobox],
  );

  const paddingField = useMemo(
    () => infobox?.property?.default?.padding,
    [infobox?.property?.default?.padding],
  );

  const gapField = useMemo(
    () => infobox?.property?.default?.gap,
    [infobox?.property?.default?.gap],
  );

  const positionField = useMemo(
    () => infobox?.property?.default?.position,
    [infobox?.property?.default?.position],
  );

  const handleBlockOpen = useCallback(
    (index: number) => {
      if (openBlocksIndex === index) {
        setOpenBlocksIndex(undefined);
      } else {
        setOpenBlocksIndex(index);
      }
    },
    [openBlocksIndex],
  );

  const handleSelectionDisable = useCallback(
    (disabled?: boolean) => setDisableSelection(!!disabled),
    [],
  );

  const handleBlockCreate = useCallback(
    (index: number) => async (extensionId?: string | undefined, pluginId?: string | undefined) => {
      if (!extensionId || !pluginId) return;
      await onBlockCreate?.(pluginId, extensionId, index);
    },
    [onBlockCreate],
  );

  const handleBlockSelect = useCallback(
    (blockId?: string) => {
      if (!isEditable || blockId === selectedBlockId || disableSelection) return;
      setSelectedBlockId(blockId);
    },
    [selectedBlockId, isEditable, disableSelection],
  );

  const handleBlockDoubleClick = useCallback(
    (blockId?: string) => {
      if (disableSelection) return;
      setSelectedBlockId(blockId);
    },
    [disableSelection],
  );

  const editModeContext: EditModeContext = useMemo(
    () => ({
      disableSelection,
      onSelectionDisable: handleSelectionDisable,
    }),
    [disableSelection, handleSelectionDisable],
  );

  useEffect(() => {
    if (infobox) {
      infobox.blocks && infobox.blocks.length > 0 && setInfoboxBlocks(infobox.blocks);
    } else {
      infoboxBlocks.length && setInfoboxBlocks([]);
      selectedBlockId !== undefined && setSelectedBlockId(undefined);
      openBlocksIndex !== undefined && setOpenBlocksIndex(undefined);
      disableSelection !== undefined && setDisableSelection(false);
    }
  }, [infobox, infoboxBlocks, selectedBlockId, openBlocksIndex, disableSelection]);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [infobox?.featureId]);

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
    setInfoboxBlocks,
    handleBlockOpen,
    handleBlockCreate,
    handleBlockSelect,
    handleBlockDoubleClick,
  };
};
