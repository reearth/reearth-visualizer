import { useCallback } from "react";

import useCommonHooks from "../commonHooks";

export default () => {
  const {
    loading,
    attachTagGroupToLayer,
    attachTagItemToLayer,
    createTagGroup,
    createTagItem,
    sceneTagGroups,
    updateTagGroup,
    layerTagGroups,
    detachTagGroupFromLayer,
    detachTagItemFromLayer,
  } = useCommonHooks();

  const handleCreateTagGroup = useCallback(
    async (label: string) => {
      const tagGroup = await createTagGroup(label);
      if (!tagGroup?.data?.createTagGroup?.tag.id) return;
      await attachTagGroupToLayer(tagGroup?.data?.createTagGroup?.tag.id);
    },
    [attachTagGroupToLayer, createTagGroup],
  );

  const handleCreateTagItem = useCallback(
    async (label: string, tagGroupId: string) => {
      const tagItem = await createTagItem(label, tagGroupId);
      if (!tagItem?.data?.createTagItem?.tag.id) return;
      await attachTagItemToLayer(tagItem?.data?.createTagItem?.tag.id);
    },
    [attachTagItemToLayer, createTagItem],
  );

  const handleAttachTagGroupToLayer = useCallback(
    async (tagGroupId: string) => {
      await attachTagGroupToLayer(tagGroupId);
    },
    [attachTagGroupToLayer],
  );

  const handleAttachTagItemToLayer = useCallback(
    async (tagItemId: string) => {
      await attachTagItemToLayer(tagItemId);
    },
    [attachTagItemToLayer],
  );

  const handleDetachTagGroupFromLayer = useCallback(
    async (tagGroupId: string) => {
      await detachTagGroupFromLayer(tagGroupId);
    },
    [detachTagGroupFromLayer],
  );

  const handleDetachTagItemFromLayer = useCallback(
    async (tagId: string) => {
      await detachTagItemFromLayer(tagId);
    },
    [detachTagItemFromLayer],
  );

  return {
    loading,
    handleCreateTagGroup,
    handleCreateTagItem,
    handleDetachTagGroup: handleDetachTagGroupFromLayer,
    handleDetachTagItem: handleDetachTagItemFromLayer,
    handleUpdateTagGroup: updateTagGroup,
    handleAttachTagGroupToLayer,
    handleAttachTagItemToLayer,
    sceneTagGroups,
    layerTagGroups,
  };
};
