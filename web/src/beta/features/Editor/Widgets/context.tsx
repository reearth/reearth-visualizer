import { createContext, useContext, ReactNode, SetStateAction } from "react";

import { AreaSize } from "@reearth/beta/ui/layout";
import { Camera } from "@reearth/beta/utils/value";
import { FlyTo } from "@reearth/core";
import { WidgetAreaState } from "@reearth/services/state";

import { SelectedWidget } from "../hooks/useWidgets";

import { Device } from "./WASToolsPanel/Devices";

export interface WidgetsPageContextType {
  handleVisualizerResize?: (props: AreaSize) => void;
  showWASEditor?: boolean;
  selectedDevice?: Device;
  handleShowWASEditorToggle: () => void;
  handleDeviceChange: (device: Device) => void;
  selectWidgetArea: (update?: SetStateAction<WidgetAreaState | undefined>) => void;
  sceneId?: string;
  selectedWidget?: SelectedWidget;
  selectWidget: (value: SelectedWidget | undefined) => void;
  selectedWidgetArea?: WidgetAreaState;
  currentCamera?: Camera;
  handleFlyTo?: FlyTo;
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
