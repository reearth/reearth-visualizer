import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import { default as Wrapper } from "@reearth/components/molecules/EarthEditor/TagPane/SceneTagPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const SceneTagPane: React.FC<Props> = () => {
  const {
    loading,
    handleCreateTagGroup,
    sceneTagGroups,
    handleCreateTagItem,
    handleRemoveTagGroup,
    handleRemoveTagItem,
    handleUpdateTagGroup,
  } = useHooks();
  return loading ? (
    <Loading />
  ) : (
    <Wrapper
      allTagGroups={sceneTagGroups}
      onTagGroupAdd={handleCreateTagGroup}
      onTagAdd={handleCreateTagItem}
      onTagGroupRemove={handleRemoveTagGroup}
      onTagItemRemove={handleRemoveTagItem}
      onTagGroupUpdate={handleUpdateTagGroup}
    />
  );
};

export default SceneTagPane;
