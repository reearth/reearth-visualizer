import { ReactNode, useMemo } from "react";

import MapSidePanel from "@reearth/beta/features/Editor/tabs/map/BottomPanel";
import type { Tab } from "@reearth/beta/features/Navbar";
import { NLSAppearance } from "@reearth/services/api/appearanceApi/utils";

import { AppearanceAddProps, AppearanceNameUpdateProps } from "./useAppearances";

type Props = {
  tab: Tab;
  sceneId?: string;
  appearances: NLSAppearance[];

  // appearances
  selectedAppearanceId?: string;
  onAppearanceAdd: (inp: AppearanceAddProps) => void;
  onAppearanceDelete: (id: string) => void;
  onAppearanceNameUpdate: (inp: AppearanceNameUpdateProps) => void;
  onAppearanceSelect: (id: string) => void;
};

export default ({
  tab,
  appearances,
  selectedAppearanceId,
  onAppearanceAdd,
  onAppearanceDelete,
  onAppearanceNameUpdate,
  onAppearanceSelect,
}: Props) => {
  const bottomPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        return (
          <MapSidePanel
            appearances={appearances}
            onAppearanceAdd={onAppearanceAdd}
            onAppearanceDelete={onAppearanceDelete}
            onAppearanceNameUpdate={onAppearanceNameUpdate}
            onAppearanceSelect={onAppearanceSelect}
            selectedAppearanceId={selectedAppearanceId}
          />
        );
      case "story":
      case "widgets":
      case "publish":
      default:
        return undefined;
    }
  }, [
    tab,
    appearances,
    onAppearanceAdd,
    onAppearanceDelete,
    onAppearanceNameUpdate,
    onAppearanceSelect,
    selectedAppearanceId,
  ]);

  return {
    bottomPanel,
  };
};
