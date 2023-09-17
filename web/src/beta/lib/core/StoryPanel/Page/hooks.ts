import { useCallback, useMemo, useState, MouseEvent } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { usePropertyFetcher } from "@reearth/services/api";
import { Item } from "@reearth/services/api/propertyApi/utils";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";

export default ({
  sceneId,
  storyId,
  pageId,
  propertyItems,
}: {
  sceneId?: string;
  storyId?: string;
  pageId?: string;
  propertyItems?: Item[];
}) => {
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();
  const [isHovered, setHover] = useState(false);

  const handleOnMouseOver = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setHover(true);
  }, []);

  const handleOnMouseOut = useCallback(() => setHover(false), []);

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

  const { useUpdatePropertyValue } = usePropertyFetcher();

  const handlePropertyValueUpdate = useCallback(
    async (
      propertyId?: string,
      schemaItemId?: string,
      fieldId?: string,
      itemId?: string,
      vt?: ValueType,
      v?: ValueTypes[ValueType],
    ) => {
      if (!propertyId || !schemaItemId || !fieldId || !vt) return;
      await useUpdatePropertyValue(propertyId, schemaItemId, itemId, fieldId, "en", v, vt);
    },
    [useUpdatePropertyValue],
  );

  const { useInstalledStoryBlocksQuery, useCreateStoryBlock, useDeleteStoryBlock } =
    useStorytellingAPI();

  const { installedStoryBlocks } = useInstalledStoryBlocksQuery({
    sceneId,
    lang: undefined,
    storyId,
    pageId,
  });

  const handleStoryBlockCreate = useCallback(
    (index?: number) => async (extensionId?: string, pluginId?: string) => {
      if (!extensionId || !pluginId || !storyId || !pageId) return;
      await useCreateStoryBlock({
        pluginId,
        extensionId,
        storyId,
        pageId,
        index,
      });
    },
    [storyId, pageId, useCreateStoryBlock],
  );

  const handleStoryBlockDelete = useCallback(
    async (blockId?: string) => {
      if (!blockId || !storyId || !pageId) return;
      await useDeleteStoryBlock({ blockId, pageId, storyId });
    },
    [storyId, pageId, useDeleteStoryBlock],
  );

  const titleProperty = useMemo(
    () => propertyItems?.find(i => i.schemaGroup === "title"),
    [propertyItems],
  );

  const titleId = useMemo(() => `${pageId}/title`, [pageId]);

  return {
    openBlocksIndex,
    installedStoryBlocks,
    titleId,
    titleProperty,
    isHovered,
    handleOnMouseOver,
    handleOnMouseOut,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handleBlockOpen,
    handlePropertyValueUpdate,
  };
};
