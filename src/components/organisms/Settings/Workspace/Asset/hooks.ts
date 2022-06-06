import { useNavigate } from "@reach/router";
import { useEffect } from "react";

import assetHooks from "@reearth/components/organisms/Common/AssetContainer/hooks";
import { useTeam, useProject } from "@reearth/state";

export type Params = {
  teamId: string;
};

export default (params: Params) => {
  const navigate = useNavigate();
  const [currentTeam] = useTeam();
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
  } = assetHooks(currentTeam?.id);

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [params, currentTeam, navigate]);

  return {
    currentProject,
    currentTeam,
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
