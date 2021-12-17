import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { useAuth } from "@reearth/auth";
import { DEFAULT_TAG_ID } from "@reearth/components/molecules/EarthEditor/TagPane/common";
import { TagGroup } from "@reearth/components/molecules/EarthEditor/TagPane/SceneTagPane";
import {
  useAttachTagToLayerMutation,
  useCreateTagGroupMutation,
  useCreateTagItemMutation,
  useDetachTagFromLayerMutation,
  useGetLayerTagsQuery,
  useGetSceneTagsQuery,
  useRemoveTagMutation,
  useUpdateTagMutation,
} from "@reearth/gql";
import { useNotification, useSceneId, useSelected } from "@reearth/state";

export default () => {
  const { isAuthenticated } = useAuth();
  const [sceneId] = useSceneId();
  const [selected] = useSelected();
  const [, setNotification] = useNotification();
  const intl = useIntl();
  const tagErrorMessage = {
    alreadyExist: intl.formatMessage({
      defaultMessage: "Same label tag already exist. Please type different label.",
    }),
    tagGroupHasTags: intl.formatMessage({
      defaultMessage: "Tag group has tags, you need to remove all tags under the tag group",
    }),
  };
  const { loading: sceneTagLoading, data: sceneData } = useGetSceneTagsQuery({
    variables: { sceneId: sceneId || "" },
    skip: !isAuthenticated || !sceneId,
  });
  const { loading: layerTagsLoading, data: layerTags } = useGetLayerTagsQuery({
    variables: { layerId: selected?.type === "layer" ? selected.layerId : "" },
    skip: selected?.type !== "layer" || !isAuthenticated,
  });

  const sceneTags = useMemo(() => {
    return sceneData?.node?.__typename === "Scene" ? sceneData.node.tags : undefined;
  }, [sceneData?.node]);

  const selectedLayerTags = useMemo(() => {
    return layerTags?.layer?.tags;
  }, [layerTags?.layer]);

  const sceneTagGroups = useMemo(() => {
    // TagItems which don't belong to any TagGroup will be in "Default" tag group
    const defaultTagGroup: TagGroup = { id: DEFAULT_TAG_ID, label: "Default", tags: [] };
    const formattedGroups: TagGroup[] = sceneTags
      ? sceneTags
          ?.map(t => {
            if (t.__typename === "TagGroup") {
              return { id: t.id, label: t.label, tags: t.tags };
            }
            defaultTagGroup.tags.push({ id: t.id, label: t.label });
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "label" in t && "tags" in t;
          })
      : [];
    return [defaultTagGroup, ...formattedGroups];
  }, [sceneTags]);

  const layerTagGroups = useMemo(() => {
    // TagItems which don't belong to any TagGroup will be in "Default" tag group
    const defaultTagGroup: TagGroup = { id: DEFAULT_TAG_ID, label: "Default", tags: [] };
    const formattedGroups: TagGroup[] = selectedLayerTags
      ? selectedLayerTags
          ?.map(t => {
            if (!t.tag) return;
            if (t.__typename === "LayerTagGroup") {
              return {
                id: t.tag?.id,
                label: t.tag?.label,
                tags: t.children.map(c => ({ id: c.tag?.id, label: c.tag?.label })),
              };
            }
            defaultTagGroup.tags.push({ id: t.tag.id, label: t.tag.label });
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "label" in t && "tags" in t;
          })
      : [];
    return [defaultTagGroup, ...formattedGroups];
  }, [selectedLayerTags]);

  const [createTagGroup] = useCreateTagGroupMutation();
  const [createTagItem] = useCreateTagItemMutation();
  const [removeTag] = useRemoveTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [attachTagToLayer] = useAttachTagToLayerMutation();
  const [detachTagFromLayer] = useDetachTagFromLayerMutation();

  const handleCreateTagGroup = useCallback(
    async (label: string) => {
      if (!sceneId) return;
      if (_doesSameLabelTagGroupExist(sceneTagGroups, label)) {
        setNotification({ type: "error", text: tagErrorMessage.alreadyExist });
        return;
      }
      return await createTagGroup({
        variables: {
          sceneId,
          label,
        },
        refetchQueries: ["getSceneTags"],
      });
    },
    [createTagGroup, sceneId, sceneTagGroups, setNotification, tagErrorMessage.alreadyExist],
  );

  const handleCreateTagItem = useCallback(
    async (label: string, tagGroupId: string) => {
      if (!sceneId) return;
      const tagGroup = sceneTagGroups.find(tg => tg.id === tagGroupId);
      if (!tagGroup) return;
      if (_doesSameLabelTagItemExist(tagGroup, label)) {
        setNotification({ type: "error", text: tagErrorMessage.alreadyExist });
        return;
      }
      const tag = await createTagItem({
        variables: {
          sceneId,
          label,
          parent: tagGroupId === DEFAULT_TAG_ID ? undefined : tagGroupId,
        },
        refetchQueries: tagGroupId === DEFAULT_TAG_ID ? ["getSceneTags"] : [],
      });
      return tag;
    },
    [createTagItem, sceneId, sceneTagGroups, setNotification, tagErrorMessage.alreadyExist],
  );

  const handleAttachTagGroupToLayer = useCallback(
    async (tagGroupId: string) => {
      if (selected?.type !== "layer") return;
      await attachTagToLayer({ variables: { tagId: tagGroupId, layerId: selected.layerId } });
    },
    [attachTagToLayer, selected],
  );

  const handleDetachTagGroupFromLayer = useCallback(
    async (tagGroupId: string) => {
      if (selected?.type !== "layer") return;
      await detachTagFromLayer({ variables: { tagId: tagGroupId, layerId: selected.layerId } });
    },
    [detachTagFromLayer, selected],
  );

  const handleAttachTagItemToLayer = useCallback(
    async (tagId: string) => {
      if (selected?.type !== "layer") return;
      await attachTagToLayer({
        variables: { tagId, layerId: selected.layerId },
      });
    },
    [attachTagToLayer, selected],
  );

  const handleDetachTagItemFromLayer = useCallback(
    async (tagItemId: string) => {
      if (selected?.type !== "layer") return;
      await detachTagFromLayer({
        variables: { tagId: tagItemId, layerId: selected.layerId },
        refetchQueries: ["getLayerTags"],
      });
    },
    [detachTagFromLayer, selected],
  );

  const handleRemoveTagItemFromScene = useCallback(
    async (tagId: string) => {
      await removeTag({ variables: { tagId }, refetchQueries: ["getSceneTags"] });
    },
    [removeTag],
  );

  const handleRemoveTagGroupFromScene = useCallback(
    async (tagGroupId: string) => {
      if (tagGroupId === DEFAULT_TAG_ID) return;
      const tagGroup = sceneTagGroups.find(tg => tg.id === tagGroupId);
      if (_doesTagGroupHasTags(tagGroup)) {
        setNotification({ type: "error", text: tagErrorMessage.tagGroupHasTags });
        return;
      }
      await removeTag({ variables: { tagId: tagGroupId }, refetchQueries: ["getSceneTags"] });
    },
    [removeTag, sceneTagGroups, setNotification, tagErrorMessage.tagGroupHasTags],
  );

  const handleUpdateTagGroup = useCallback(
    async (tagGroupId: string, label: string) => {
      if (!sceneId) return;
      if (_doesSameLabelTagGroupExist(sceneTagGroups, label)) {
        setNotification({ type: "error", text: tagErrorMessage.alreadyExist });
        return;
      }
      await updateTag({
        variables: { tagId: tagGroupId, sceneId: sceneId, label },
      });
    },
    [sceneId, sceneTagGroups, setNotification, tagErrorMessage.alreadyExist, updateTag],
  );

  const _doesSameLabelTagGroupExist = (tagGroups: TagGroup[], label: string) => {
    return tagGroups.map(tg => tg.label).includes(label);
  };

  const _doesSameLabelTagItemExist = (tagGroup: TagGroup, label: string) => {
    return tagGroup?.tags?.map(t => t.label).includes(label);
  };

  const _doesTagGroupHasTags = (tagGroup?: TagGroup) => {
    return tagGroup?.tags.length;
  };

  return {
    createTagGroup: handleCreateTagGroup,
    createTagItem: handleCreateTagItem,
    attachTagGroupToLayer: handleAttachTagGroupToLayer,
    attachTagItemToLayer: handleAttachTagItemToLayer,
    detachTagGroupFromLayer: handleDetachTagGroupFromLayer,
    detachTagItemFromLayer: handleDetachTagItemFromLayer,
    removeTagGroupFromScene: handleRemoveTagGroupFromScene,
    removeTagItemFromScene: handleRemoveTagItemFromScene,
    updateTagGroup: handleUpdateTagGroup,
    sceneTagGroups,
    loading: sceneTagLoading || layerTagsLoading,
    layerTagGroups,
  };
};
