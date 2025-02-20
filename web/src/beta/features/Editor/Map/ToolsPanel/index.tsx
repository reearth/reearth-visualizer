import { Placement } from "@floating-ui/react";
import { IconButton, IconName } from "@reearth/beta/lib/reearth-ui";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useEffect, useMemo } from "react";

import { useMapPage } from "../context";

type SketchTool = {
  icon: IconName;
  selected: boolean;
  tooltipText: string;
  placement?: Placement;
  onClick: () => void;
};

const ToolsPanel: FC = () => {
  const { sketchEnabled, sketchType, handleSketchTypeChange } = useMapPage();
  const t = useT();
  const sketchTools: SketchTool[] = useMemo(
    () => [
      {
        icon: "mapPin",
        selected: sketchEnabled && sketchType === "marker",
        tooltipText: t("Marker"),
        placement: "top",
        onClick: () => handleSketchTypeChange("marker")
      },
      {
        icon: "polyline",
        selected: sketchEnabled && sketchType === "polyline",
        tooltipText: t("Polyline"),
        placement: "top",
        onClick: () => handleSketchTypeChange("polyline")
      },
      {
        icon: "circle",
        selected: sketchEnabled && sketchType === "circle",
        tooltipText: t("Circle"),
        placement: "top",
        onClick: () => handleSketchTypeChange("circle")
      },
      {
        icon: "square",
        selected: sketchEnabled && sketchType === "rectangle",
        tooltipText: t("Rectangle"),
        placement: "top",
        onClick: () => handleSketchTypeChange("rectangle")
      },
      {
        icon: "polygon",
        selected: sketchEnabled && sketchType === "polygon",
        tooltipText: t("Polygon"),
        placement: "top",
        onClick: () => handleSketchTypeChange("polygon")
      },
      {
        icon: "cylinder",
        selected: sketchEnabled && sketchType === "extrudedCircle",
        tooltipText: t("Extruded circle"),
        placement: "top",
        onClick: () => handleSketchTypeChange("extrudedCircle")
      },
      {
        icon: "cube",
        selected: sketchEnabled && sketchType === "extrudedRectangle",
        tooltipText: t("Extruded rectangle"),
        placement: "top",
        onClick: () => handleSketchTypeChange("extrudedRectangle")
      },
      {
        icon: "extrude",
        selected: sketchEnabled && sketchType === "extrudedPolygon",
        tooltipText: t("Extruded polygon"),
        placement: "top",
        onClick: () => handleSketchTypeChange("extrudedPolygon")
      }
    ],
    [sketchEnabled, sketchType, t, handleSketchTypeChange]
  );

  useEffect(() => {
    if (!sketchEnabled) handleSketchTypeChange(undefined);
  }, [sketchEnabled, handleSketchTypeChange]);

  return (
    <Panel storageId="editor-map-tools-panel" extend>
      <SketchToolsWrapper>
        {sketchTools.map(
          ({ icon, selected, tooltipText, placement, onClick }) => (
            <IconButton
              key={icon}
              icon={icon}
              disabled={!sketchEnabled}
              appearance={"simple"}
              active={selected}
              tooltipText={tooltipText}
              placement={placement}
              onClick={onClick}
            />
          )
        )}
      </SketchToolsWrapper>
    </Panel>
  );
};

export default ToolsPanel;

const SketchToolsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: theme.spacing.smallest,
  padding: theme.spacing.smallest
}));
