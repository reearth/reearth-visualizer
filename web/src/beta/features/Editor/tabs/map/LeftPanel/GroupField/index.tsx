import { useCallback, useEffect, useRef } from "react";

import ListItem from "@reearth/beta/components/ListItem";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import type {
  LayerNameUpdateProps,
  LayerVisibilityUpdateProps,
} from "@reearth/beta/features/Editor/useLayers";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import type { Scene, ScenePropertyCollection } from "@reearth/services/api/sceneApi";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Layers from "../Layers";

type GroupSectionFieldProps = {
  scene?: Scene;
  layers: NLSLayer[];
  selectedLayerId?: string;
  selectedSceneSetting?: string;
  clickAway: boolean;
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onSceneSettingSelect: (groupId: string) => void;
  onDataSourceManagerOpen: () => void;
  onSketchLayerManagerOpen: () => void;
  onLayerVisibilityUpate: (inp: LayerVisibilityUpdateProps) => void;
  onFlyTo?: FlyTo;
};

const GroupSectionField: React.FC<GroupSectionFieldProps> = ({
  scene,
  layers,
  selectedLayerId,
  selectedSceneSetting,
  clickAway,
  onLayerDelete,
  onLayerNameUpdate,
  onLayerSelect,
  onSceneSettingSelect,
  onDataSourceManagerOpen,
  onSketchLayerManagerOpen,
  onLayerVisibilityUpate,
  onFlyTo,
}) => {
  const t = useT();

  const handleTranslatedCollectionName = useCallback(
    (name?: ScenePropertyCollection) => {
      return name === "main"
        ? t("Main")
        : name === "tiles"
        ? t("Tiles")
        : name === "terrain"
        ? t("Terrain")
        : name === "globe"
        ? t("Globe")
        : name === "sky"
        ? t("Sky")
        : name === "camera"
        ? t("Camera")
        : t("Unknown scene setting");
    },
    [t],
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && clickAway) {
        onLayerSelect("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clickAway, onLayerSelect]);

  return (
    <div ref={ref}>
      <StyledSidePanelSectionField title={t("Scene")} startCollapsed gap={0} storageKey="scene">
        {[...new Set(scene?.property?.schema?.groups.map(({ collection }) => collection))].map(
          (collection, index) =>
            collection && (
              <ListItem
                key={index}
                isSelected={selectedSceneSetting === collection}
                onItemClick={() => onSceneSettingSelect(collection)}>
                {handleTranslatedCollectionName(collection as ScenePropertyCollection)}
              </ListItem>
            ),
        )}
      </StyledSidePanelSectionField>
      <StyledSidePanelSectionField title={t("Layers")} storageKey="layer">
        <Layers
          layers={layers}
          selectedLayerId={selectedLayerId}
          onLayerDelete={onLayerDelete}
          onLayerNameUpdate={onLayerNameUpdate}
          onLayerSelect={onLayerSelect}
          onDataSourceManagerOpen={onDataSourceManagerOpen}
          onSketchLayerManagerOpen={onSketchLayerManagerOpen}
          onLayerVisibilityUpate={onLayerVisibilityUpate}
          onFlyTo={onFlyTo}
        />
      </StyledSidePanelSectionField>
    </div>
  );
};

const StyledSidePanelSectionField = styled(SidePanelSectionField)`
  background: inherit;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weaker};
  border-radius: 0;
`;

export default GroupSectionField;
