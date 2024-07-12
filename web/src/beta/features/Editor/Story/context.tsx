import { createContext, useContext, ReactNode } from "react";

import { AreaSize } from "@reearth/beta/ui/layout";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { FlyTo } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { Page } from "@reearth/services/api/storytellingApi/utils";

import { Tab } from "../../Navbar";

export interface StoryPageContextType {
  handleVisualizerResize?: (props: AreaSize) => void;
  storyPages?: Page[];
  handleStoryPageSelect: (id?: string) => void;
  handleStoryPageAdd: (isSwipeable: boolean) => void;
  // onPageDuplicate: (id: string) => void; // not used
  handleStoryPageDelete: (id: string) => void;
  handleStoryPageMove: (id: string, targetIndex: number) => void;
  handlePropertyValueUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  sceneId?: string;
  selectedStoryPage?: Page;
  layers?: NLSLayer[];
  tab?: Tab;
  handleFlyTo?: FlyTo;
  handleStoryPageUpdate?: (id: string, layers: string[]) => void;
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
