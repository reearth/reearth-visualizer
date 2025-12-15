import { Window, Area, AreaRef } from "@reearth/app/ui/layout";
import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { FC, useEffect, useRef } from "react";

import { useMapPage } from "./context";
import InspectorPanel from "./InspectorPanel";
import LayersPanel from "./LayersPanel";
import LayerStylePanel from "./LayerStylePanel";
import MapGoogleSearch from "./MapGoogleSearch";
import PhotoOverlayEditor from "./PhotoOverlayEditor";
import ScenePanel from "./ScenePanel";
import {
  photoOverlayEditingFeatureAtom,
  PhotoOverlayPreviewAtom,
  SketchFeatureTooltipAtom
} from "./state";
import ToolsPanel from "./ToolsPanel";

const Map: FC = () => {
  const { handleVisualizerResize, handleSketchGeometryEditCancel } =
    useMapPage();

  const windowRef = useRef<HTMLDivElement>(null);
  const secRightAreaRef = useRef<AreaRef>(null);
  const rightAreaRef = useRef<AreaRef>(null);

  const [photoOverlayEditingFeature, setPhotoOverlayEditingFeature] = useAtom(
    photoOverlayEditingFeatureAtom
  );
  const setPhotoOverlayPreview = useSetAtom(PhotoOverlayPreviewAtom);
  const setSketchLayerTooltip = useSetAtom(SketchFeatureTooltipAtom);

  const hideNormalPanels = !!photoOverlayEditingFeature;

  useEffect(() => {
    return () => {
      setPhotoOverlayEditingFeature(RESET);
      setPhotoOverlayPreview(RESET);
      setSketchLayerTooltip(RESET);
      handleSketchGeometryEditCancel();
    };
  }, [
    handleSketchGeometryEditCancel,
    setPhotoOverlayEditingFeature,
    setPhotoOverlayPreview,
    setSketchLayerTooltip
  ]);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area
          direction="column"
          resizableEdge="right"
          storageId="editor-map-left-area"
          dataTestid="editor-map-left-area"
          hidden={hideNormalPanels}
        >
          <ScenePanel />
          <LayersPanel />
        </Area>
        <Area direction="column" extend asWrapper>
          <Area initialHeight={28} hidden={hideNormalPanels}>
            <ToolsPanel />
            <MapGoogleSearch />
          </Area>
          <Area
            extend
            onResize={handleVisualizerResize}
            windowRef={windowRef}
            passive
          >
            {photoOverlayEditingFeature && <PhotoOverlayEditor />}
          </Area>
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          storageId="editor-map-sec-right-area"
          ref={secRightAreaRef}
          hidden={hideNormalPanels}
        >
          <InspectorPanel showCollapseArea areaRef={secRightAreaRef} />
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          storageId="editor-map-right-area"
          ref={rightAreaRef}
          hidden={hideNormalPanels}
        >
          <LayerStylePanel showCollapseArea areaRef={rightAreaRef} />
        </Area>
      </Area>
    </Window>
  );
};

export default Map;
