import { useState, useCallback, useRef, useEffect, useMemo } from "react";

import { autoFillPage, onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
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
  const layerStylesWrapperRef = useRef<HTMLDivElement>(null);
  const isGettingMore = useRef(false);

  const { useGetLayerStylesQuery } = useLayerStylesFetcher();
  const { layerStyles, loading, isRefetching, fetchMore } = useGetLayerStylesQuery({ sceneId });
  const [selectedLayerStyles, selectLayerStyle] = useState<LayerStyle[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>();
  const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchTerm ?? "");

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setLocalSearchTerm(value);
    },
    [setLocalSearchTerm],
  );

  const handleSearchTerm = useCallback((term?: string) => setSearchTerm(term), []);

  const handleSearch = useCallback(() => {
    if (!localSearchTerm || localSearchTerm.length < 1) {
      handleSearchTerm?.(undefined);
    } else {
      handleSearchTerm?.(localSearchTerm);
    }
  }, [localSearchTerm, handleSearchTerm]);

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

  const isLayerStylesLoading = useMemo(() => loading ?? isRefetching, [loading, isRefetching]);

  useEffect(() => {
    if (layerStylesWrapperRef.current && !isLayerStylesLoading) {
      autoFillPage(layerStylesWrapperRef, handleGetMoreLayerStyles);
    }
  }, [handleGetMoreLayerStyles, isLayerStylesLoading]);

  return {
    layerStyles,
    searchTerm,
    localSearchTerm,
    layerStylesWrapperRef,
    isLayerStylesLoading: loading ?? isRefetching,
    selectedLayerStyles,
    onScrollToBottom,
    selectLayerStyle,
    handleSelectLayerStyle,
    handleSearchInputChange,
    handleSearch,
  };
};
