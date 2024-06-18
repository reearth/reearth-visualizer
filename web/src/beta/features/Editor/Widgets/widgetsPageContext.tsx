import { createContext, useContext, ReactNode, SetStateAction } from "react";

import { AreaSize } from "@reearth/beta/ui/layout";
import { Camera } from "@reearth/beta/utils/value";
import { FlyTo } from "@reearth/core";
import { WidgetAreaState } from "@reearth/services/state";

import { SelectedWidget } from "../hooks/useWidgets";

import { Device } from "./WASToolsPanel/Devices";

interface WidgetsPageContextType {
  onVisualizerResize?: (props: AreaSize) => void;
  showWidgetEditor?: boolean;
  selectedDevice?: Device;
  onShowWidgetEditor: () => void;
  onDeviceChange: (device: Device) => void;
  setSelectedWidgetArea: (update?: SetStateAction<WidgetAreaState | undefined>) => void;
  sceneId?: string;
  selectedWidget?: SelectedWidget;
  setSelectedWidget: (value: SelectedWidget | undefined) => void;
  selectedWidgetArea?: WidgetAreaState;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
}

const WidgetsPageContext = createContext<WidgetsPageContextType | undefined>(undefined);

export const WidgetsPageProvider = ({
  value,
  children,
}: {
  value: WidgetsPageContextType;
  children: ReactNode;
}) => {
  return <WidgetsPageContext.Provider value={value}>{children}</WidgetsPageContext.Provider>;
};

export const useWidgetsPage = (): WidgetsPageContextType => {
  const context = useContext(WidgetsPageContext);
  if (!context) {
    throw new Error("useWidgetsPage must be used within a WidgetsPageContext");
  }
  return context;
};
