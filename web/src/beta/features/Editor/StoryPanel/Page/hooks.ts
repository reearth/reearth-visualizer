import { useCallback, useState } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { usePropertyFetcher } from "@reearth/services/api";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";

export default ({
  sceneId,
  storyId,
  pageId,
}: {
  sceneId?: string;
  storyId?: string;
  pageId?: string;
}) => {
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

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

  return {
    openBlocksIndex,
    installedStoryBlocks,
    handleStoryBlockCreate,
    handleStoryBlockDelete,
    handleBlockOpen,
    handlePropertyValueUpdate,
  };
};
