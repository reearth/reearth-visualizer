import { FC, PropsWithChildren, RefObject, createContext, useContext, useMemo } from "react";

import { Ref as MapRef } from "../Map";

const context = createContext<RefObject<MapRef> | undefined>(undefined);

export type Context = RefObject<MapRef>;

export const useVisualizer = (): RefObject<MapRef> => {
  const value = useContext(context);
  if (!value) {
    throw new Error("Visualizer is not declared. You have to use this hook inside of Visualizer");
  }
  return value;
};

const filterMapRefToContext = (mapRef: RefObject<MapRef>): Context => {
  return mapRef as Context;
};

export const VisualizerProvider: FC<PropsWithChildren<{ mapRef: RefObject<MapRef> }>> = ({
  mapRef,
  children,
}) => {
  const value = useMemo(() => filterMapRefToContext(mapRef), [mapRef]);
  return <context.Provider value={value}>{children}</context.Provider>;
};
