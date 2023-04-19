import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import assetHooks from "@reearth/components/organisms/Common/AssetContainer/hooks";
import { useWorkspace, useProject } from "@reearth/state";

export type Params = {
  workspaceId: string;
};

export default (params: Params) => {
  const navigate = useNavigate();
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();

  const {
    assets,
    isLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    handleGetMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
    removeAssets,
  } = assetHooks(currentWorkspace?.id);

  useEffect(() => {
    if (params.workspaceId && currentWorkspace?.id && params.workspaceId !== currentWorkspace.id) {
      navigate(`/settings/workspaces/${currentWorkspace?.id}/asset`);
    }
  }, [params, currentWorkspace, navigate]);

  return {
    currentProject,
    currentWorkspace,
    assets,
    isLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    handleGetMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
    removeAssets,
  };
};
