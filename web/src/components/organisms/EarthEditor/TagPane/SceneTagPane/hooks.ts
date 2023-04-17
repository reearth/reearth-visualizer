import { useCallback } from "react";

import useCommonHooks from "../commonHooks";

export default () => {
  const {
    loading,
    removeTagGroupFromScene,
    removeTagItemFromScene,
    createTagGroup,
    createTagItem,
    sceneTagGroups,
    updateTagGroup,
  } = useCommonHooks();

  const handleCreateTagGroup = useCallback(
    async (label: string) => {
      createTagGroup(label);
    },
    [createTagGroup],
  );

  const handleCreateTagItem = useCallback(
    async (label: string, tagGroupId: string) => {
      await createTagItem(label, tagGroupId);
    },
    [createTagItem],
  );

  return {
    loading,
    handleCreateTagGroup,
    handleCreateTagItem,
    handleRemoveTagGroup: removeTagGroupFromScene,
    handleRemoveTagItem: removeTagItemFromScene,
    handleUpdateTagGroup: updateTagGroup,
    sceneTagGroups,
  };
};
