import { useState, useCallback, useRef, useEffect } from "react";

import { autoFillPage } from "@reearth/beta/utils/infinite-scroll";
import { useLayerStylesFetcher } from "@reearth/services/api";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

const LayerStylesPerPage = 20;

function pagination(endCursor?: string | null) {
  return {
    after: null,
    before: endCursor,
    first: LayerStylesPerPage,
    last: LayerStylesPerPage,
  };
}

export default ({ sceneId }: { sceneId?: string }) => {
  const { useGetLayerStylesQuery } = useLayerStylesFetcher();
  const { layerStyles, loading, isRefetching, fetchMore } = useGetLayerStylesQuery({ sceneId });
  const [selectedLayerStyles, selectLayerStyle] = useState<LayerStyle[]>([]);

  const isGettingMore = useRef(false);

  const handleSelectLayerStyle = useCallback(
    (layerStyle?: LayerStyle) => {
      if (!layerStyle) return;
      selectLayerStyle(!selectedLayerStyles.includes(layerStyle) ? [layerStyle] : []);
    },
    [selectLayerStyle, selectedLayerStyles],
  );

  const handleGetMoreLayerStyles = useCallback(async () => {
    if (!isGettingMore.current) {
      isGettingMore.current = true;
      await fetchMore({
        variables: {
          pagination: pagination(),
        },
      });
      isGettingMore.current = false;
    }
  }, [fetchMore, isGettingMore]);

  const isLayerStylesLoading = loading ?? isRefetching;

  const layerStylesWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (layerStylesWrapperRef.current && !isLayerStylesLoading)
      autoFillPage(layerStylesWrapperRef, handleGetMoreLayerStyles);
  }, [handleGetMoreLayerStyles, isLayerStylesLoading]);

  return {
    layerStyles,
    layerStylesWrapperRef,
    isLayerStylesLoading: loading ?? isRefetching,
    selectedLayerStyles,
    selectLayerStyle,
    handleSelectLayerStyle,
  };
};
