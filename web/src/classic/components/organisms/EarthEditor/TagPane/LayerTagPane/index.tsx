import React from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import { default as Wrapper } from "@reearth/classic/components/molecules/EarthEditor/TagPane/LayerTagPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const LayerTagPane: React.FC<Props> = () => {
  const {
    loading,
    handleCreateTagGroup,
    sceneTagGroups,
    handleCreateTagItem,
    handleAttachTagGroupToLayer,
    handleAttachTagItemToLayer,
    handleDetachTagGroup,
    handleDetachTagItem,
    layerTagGroups,
  } = useHooks();
  return loading ? (
    <Loading />
  ) : (
    <Wrapper
      allTagGroups={sceneTagGroups}
      layerTagGroups={layerTagGroups}
      onTagGroupAdd={handleCreateTagGroup}
      onTagAdd={handleCreateTagItem}
      onTagAttach={handleAttachTagItemToLayer}
      onTagGroupAttach={handleAttachTagGroupToLayer}
      onTagGroupDetach={handleDetachTagGroup}
      onTagItemDetach={handleDetachTagItem}
    />
  );
};

export default LayerTagPane;
