import React, { createContext, useContext, useMemo } from "react";
import { Cartesian3, Viewer } from "cesium";
import { useCesium } from "resium";

import { Layer } from ".";

export type ReearthAPIContext = {
  cesiumViewer: Viewer;
  selectLayer: (layerId?: string, reason?: string) => void;
  getLayers: (layerIds: string[]) => (Layer | undefined)[] | undefined;
  getLayer: (layerId: string) => Layer | undefined;
  getLayerPosition: (layerId: string) => Cartesian3 | undefined;
};

export type Props = {
  layers?: Layer[];
  onEntitySelect?: (id?: string, reason?: string) => void;
};

const context = createContext<ReearthAPIContext | undefined>(undefined);

export const useReearthPluginAPI = () => useContext(context);

export const Provider: React.FC<Props> = ({ children, layers, onEntitySelect }) => {
  const { viewer } = useCesium();

  const api = useMemo<ReearthAPIContext | undefined>(
    () =>
      viewer
        ? {
            cesiumViewer: viewer,
            selectLayer: (id?: string, reason?: string) => {
              if (id) {
                const entity = viewer.entities.getById(id);
                if (entity) {
                  viewer.selectedEntity = entity;
                }
              } else {
                viewer.selectedEntity = undefined;
              }
              onEntitySelect?.(id, reason);
            },
            getLayers: (layerIds: string[]): (Layer | undefined)[] | undefined => {
              if (!layers) return undefined;
              return layerIds.map(l => layers.find(m => l === m.id));
            },
            getLayer: (id: string) => layers?.find(l => l.id === id),
            getLayerPosition: (id: string) => {
              return viewer.entities.getById(id)?.position?.getValue(undefined as any);
            },
          }
        : undefined,
    [layers, onEntitySelect, viewer],
  );

  return <context.Provider value={api}>{children}</context.Provider>;
};
