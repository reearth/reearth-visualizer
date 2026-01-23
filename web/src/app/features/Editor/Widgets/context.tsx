import { AreaSize } from "@reearth/app/ui/layout";
import { FlyTo } from "@reearth/core";
import { WidgetAreaState } from "@reearth/services/state";
import { createContext, useContext, ReactNode, SetStateAction } from "react";

import { SelectedWidget } from "../hooks/useWidgets";

export interface WidgetsPageContextType {
  handleVisualizerResize?: (props: AreaSize) => void;
  showWASEditor?: boolean;
  handleShowWASEditorToggle: () => void;
  selectWidgetArea: (
    update?: SetStateAction<WidgetAreaState | undefined>
  ) => void;
  sceneId?: string;
  selectedWidget?: SelectedWidget;
  selectWidget: (value: SelectedWidget | undefined) => void;
  selectedWidgetArea?: WidgetAreaState;
  handleFlyTo?: FlyTo;
}

const WidgetsPageContext = createContext<WidgetsPageContextType | undefined>(
  undefined
);

export const WidgetsPageProvider = ({
  value,
  children
}: {
  value: WidgetsPageContextType;
  children: ReactNode;
}) => {
  return (
    <WidgetsPageContext.Provider value={value}>
      {children}
    </WidgetsPageContext.Provider>
  );
};

export const useWidgetsPage = (): WidgetsPageContextType => {
  const context = useContext(WidgetsPageContext);
  if (!context) {
    throw new Error("useWidgetsPage must be used within a WidgetsPageContext");
  }
  return context;
};
