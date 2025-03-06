import { Placement } from "@floating-ui/react";
import { Button, IconButton, IconName } from "@reearth/beta/lib/reearth-ui";
import ConfirmModal from "@reearth/beta/ui/components/ConfirmModal";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { useMapPage } from "../context";
import { SketchFeatureTooltipAtom } from "../state";

type SketchTool = {
  icon: IconName;
  selected: boolean;
  tooltipText: string;
  placement?: Placement;
  onClick: () => void;
};

const ToolsPanel: FC = () => {
  const {
    sketchEnabled,
    sketchType,
    selectedLayerId,
    selectedSketchFeature,
    sketchEditingFeature,
    handleSketchTypeChange,
    handleSketchGeometryEditStart,
    handleGeoJsonFeatureDelete
  } = useMapPage();

  const t = useT();
  const [showDeleteFeatureConfirmModal, setShowDeleteFeatureConfirmModal] =
    useState(false);

  const setSketchLayerTooltip = useSetAtom(SketchFeatureTooltipAtom);
  const sketchTools: SketchTool[] = useMemo(
    () => [
      {
        icon: "mapPin",
        selected: sketchEnabled && sketchType === "marker",
        tooltipText: t("Marker"),
        placement: "top",
        onClick: () => {
          handleSketchTypeChange("marker");
          setSketchLayerTooltip({
            description: t(
              "Click to place the point  Right click to cancel drawing"
            )
          });
        }
      },
      {
        icon: "polyline",
        selected: sketchEnabled && sketchType === "polyline",
        tooltipText: t("Polyline"),
        placement: "top",
        onClick: () => {
          handleSketchTypeChange("polyline");
          setSketchLayerTooltip({
            description: t(
              "Click to draw the line Right click to cancel drawing"
            )
          });
        }
      },
      {
        icon: "circle",
        selected: sketchEnabled && sketchType === "circle",
        tooltipText: t("Circle"),
        placement: "top",
        onClick: () => {
          handleSketchTypeChange("circle");
          setSketchLayerTooltip({
            description: t(
              "Click to draw the circle Right click to cancel drawing"
            )
          });
        }
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
    [
      sketchEnabled,
      sketchType,
      t,
      handleSketchTypeChange,
      setSketchLayerTooltip
    ]
  );

  const isEditingGeometry = useMemo(
    () =>
      selectedSketchFeature?.properties?.id ===
      sketchEditingFeature?.feature?.id,
    [selectedSketchFeature?.properties?.id, sketchEditingFeature?.feature?.id]
  );

  useEffect(() => {
    if (!sketchEnabled) {
      handleSketchTypeChange(undefined);
      setSketchLayerTooltip(RESET);
    }
  }, [sketchEnabled, handleSketchTypeChange, setSketchLayerTooltip]);

  useEffect(() => {
    if (!sketchType) setSketchLayerTooltip(RESET);
  }, [setSketchLayerTooltip, sketchType]);

  const handleEditSketchFeature = useCallback(() => {
    handleSketchGeometryEditStart();
    handleSketchTypeChange(undefined);
    setSketchLayerTooltip?.({
      description: t(
        "Drag to adjust the position Select a point and press Delete to remove it Double click to save the edits Right click to cancel editing"
      )
    });
  }, [
    handleSketchGeometryEditStart,
    handleSketchTypeChange,
    setSketchLayerTooltip,
    t
  ]);

  const handleDeleteSketchFeature = useCallback(() => {
    if (!selectedLayerId || !selectedSketchFeature?.id) return;
    handleGeoJsonFeatureDelete?.({
      layerId: selectedLayerId,
      featureId: selectedSketchFeature.id
    });
    setShowDeleteFeatureConfirmModal(false);
    handleSketchTypeChange(undefined);
  }, [
    selectedLayerId,
    selectedSketchFeature?.id,
    handleGeoJsonFeatureDelete,
    handleSketchTypeChange
  ]);
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
        <SketchFeatureButtons>
          <>
            <IconButton
              icon="pencilLine"
              disabled={!selectedSketchFeature}
              appearance={"simple"}
              active={isEditingGeometry}
              placement="top"
              onClick={handleEditSketchFeature}
              tooltipText={t("Edit Geometry")}
            />
            <IconButton
              icon="trash"
              disabled={!selectedSketchFeature}
              appearance={"simple"}
              tooltipText={t("Delete Feature")}
              placement="top"
              onClick={() => setShowDeleteFeatureConfirmModal(true)}
            />
          </>
        </SketchFeatureButtons>
      </SketchToolsWrapper>
      {showDeleteFeatureConfirmModal && (
        <ConfirmModal
          visible={true}
          title={t("Delete this feature?")}
          description={t(
            "Are you sure you want to delete this feature? If deleted, you can not recover it again."
          )}
          actions={
            <>
              <Button
                size="normal"
                title={t("Cancel")}
                onClick={() => setShowDeleteFeatureConfirmModal(false)}
              />
              <Button
                size="normal"
                title={t("Delete")}
                appearance="dangerous"
                onClick={handleDeleteSketchFeature}
              />
            </>
          }
        />
      )}
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

const SketchFeatureButtons = styled("div")(({ theme }) => ({
  display: "flex",
  borderLeft: `0.5px solid ${theme.outline.weak}`,
  padding: theme.spacing.smallest,
  gap: theme.spacing.small
}));
