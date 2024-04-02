import { useEffect, useRef, useState } from "react";

import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import GroupSectionField from "@reearth/beta/features/Editor/tabs/map/LeftPanel/GroupField";
import { FlyTo } from "@reearth/beta/lib/core/types";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import type { Scene } from "@reearth/services/api/sceneApi";
import { useT } from "@reearth/services/i18n";

import type { LayerNameUpdateProps, LayerVisibilityUpdateProps } from "../../../useLayers";

type Props = {
  layers: NLSLayer[];
  scene?: Scene;
  selectedLayerId?: string;
  selectedSceneSetting?: string;
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onSceneSettingSelect: (groupId: string) => void;
  onDataSourceManagerOpen: () => void;
  onSketchLayerManagerOpen: () => void;
  onLayerVisibilityUpate: (inp: LayerVisibilityUpdateProps) => void;
  onFlyTo?: FlyTo;
};

const MapSidePanel: React.FC<Props> = ({
  layers,
  scene,
  selectedLayerId,
  selectedSceneSetting,
  onLayerDelete,
  onLayerSelect,
  onLayerNameUpdate,
  onSceneSettingSelect,
  onDataSourceManagerOpen,
  onSketchLayerManagerOpen,
  onLayerVisibilityUpate,
  onFlyTo,
}) => {
  const t = useT();
  const [clickAway, setClickAway] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setClickAway(false);
      } else setClickAway(true);
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [onLayerSelect]);

  return (
    <SidePanelCommon
      ref={ref}
      location="left"
      contents={[
        {
          id: "outline",
          title: t("Outline"),
          children: (
            <GroupSectionField
              scene={scene}
              layers={layers}
              selectedLayerId={selectedLayerId}
              selectedSceneSetting={selectedSceneSetting}
              onLayerDelete={onLayerDelete}
              onLayerNameUpdate={onLayerNameUpdate}
              onLayerSelect={onLayerSelect}
              onSceneSettingSelect={onSceneSettingSelect}
              onDataSourceManagerOpen={onDataSourceManagerOpen}
              onSketchLayerManagerOpen={onSketchLayerManagerOpen}
              onLayerVisibilityUpate={onLayerVisibilityUpate}
              onFlyTo={onFlyTo}
              clickAway={clickAway}
            />
          ),
        },
      ]}
    />
  );
};

export default MapSidePanel;
