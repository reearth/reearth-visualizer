import { AreaSize } from "@reearth/app/ui/layout";
import { createContext, useContext, ReactNode } from "react";

import { SubProject } from "../hooks/useUI";

export interface PublishPageContextType {
  activeSubProject?: SubProject | undefined;
  handleActiveSubProjectChange?: (subProject: SubProject | undefined) => void;
  handleVisualizerResize?: (props: AreaSize) => void;
  projectId?: string;
  sceneId?: string;
}

const PublishPageContext = createContext<PublishPageContextType | undefined>(
  undefined
);

export const PublishPageProvider = ({
  value,
  children
}: {
  value: PublishPageContextType;
  children: ReactNode;
}) => {
  return (
    <PublishPageContext.Provider value={value}>
      {children}
    </PublishPageContext.Provider>
  );
};

export const usePublishPage = (): PublishPageContextType => {
  const context = useContext(PublishPageContext);
  if (!context) {
    throw new Error("usePublishPage must be used within a PublishPageProvider");
  }
  return context;
};
