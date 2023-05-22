import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import assetHooks from "@reearth/classic/components/organisms/Common/AssetContainer/hooks";
import { useWorkspace, useProject, useSessionWorkspace } from "@reearth/services/state";

export type Params = {
  workspaceId: string;
};

export default (params: Params) => {
  const navigate = useNavigate();
  const [currentWorkspace] = useSessionWorkspace();
  const [lastWorkspace] = useWorkspace();

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
      navigate(`/settings/workspaces/${currentWorkspace?.id ?? lastWorkspace?.id}/asset`);
    }
  }, [params, currentWorkspace, navigate, lastWorkspace?.id]);

  return {
    currentProject,
    currentWorkspace: currentWorkspace ?? lastWorkspace,
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
