import { createContext, useContext, ReactNode } from "react";

import { AreaSize } from "@reearth/beta/ui/layout";
import { Camera, ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { FlyTo } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { Page } from "@reearth/services/api/storytellingApi/utils";

import { Tab } from "../../Navbar";

interface StoryPageContextType {
  onVisualizerResize?: (props: AreaSize) => void;
  storyPages: Page[];
  onPageSelect: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  // onPageDuplicate: (id: string) => void; // not used
  onPageDelete: (id: string) => void;
  onPageMove: (id: string, targetIndex: number) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  sceneId?: string;
  selectedStoryPage?: Page;
  currentCamera?: Camera;
  layers?: NLSLayer[];
  tab?: Tab;
  onFlyTo?: FlyTo;
  onPageUpdate?: (id: string, layers: string[]) => void;
}

const StoryPageContext = createContext<StoryPageContextType | undefined>(undefined);

export const StoryPageProvider = ({
  value,
  children,
}: {
  value: StoryPageContextType;
  children: ReactNode;
}) => {
  return <StoryPageContext.Provider value={value}>{children}</StoryPageContext.Provider>;
};

export const useStoryPage = (): StoryPageContextType => {
  const context = useContext(StoryPageContext);
  if (!context) {
    throw new Error("useStoryPage must be used within a StoryPageProvider");
  }
  return context;
};
