import {
  IconButton,
  PopupMenu,
  PopupMenuItem
} from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback } from "react";

import { LayerStyleAddProps } from "../../../hooks/useLayerStyles";

import {
  defaultStyle,
  professionalStyle,
  pointStyle,
  pointWithLabelStyle,
  polylineStyle,
  polygonStyle,
  extrudedPolygonStyle,
  threeDTilesStyle,
  simpleStyle,
  colorBuildingsByHeight,
  sketchLayerStyle
} from "./presetLayerStyles";

type PresetLayerStyleProps = {
  layerStyles: LayerStyle[] | undefined;
  onLayerStyleAdd: (inp: LayerStyleAddProps) => void;
};

const PresetLayerStyle: FC<PresetLayerStyleProps> = ({
  layerStyles,
  onLayerStyleAdd
}) => {
  const t = useT();

  const handleLayerStyleAddition = useCallback(
    (value?: Record<string, unknown>, styleName?: string) => {
      onLayerStyleAdd({
        name: styleName
          ? styleName
          : `${t("Style_")}${layerStyles?.length ?? 0 + 1}`,
        value: value || {}
      });
    },
    [onLayerStyleAdd, t, layerStyles?.length]
  );

  const menuItems: PopupMenuItem[] = [
    {
      id: "empty",
      title: t("Empty"),
      onClick: () => handleLayerStyleAddition({})
    },
    {
      id: "sketch",
      title: t("Sketch"),
      onClick: () => handleLayerStyleAddition(sketchLayerStyle, "Sketch")
    },
    {
      id: "default",
      title: t("Default"),
      onClick: () => handleLayerStyleAddition(defaultStyle, "Default")
    },
    {
      id: "professional",
      title: t("Professional"),
      onClick: () => handleLayerStyleAddition(professionalStyle, "Professional")
    },
    {
      id: "basicGeometry",
      title: t("Basic Geometry"),
      icon: "folderSimple",
      subItem: [
        {
          id: "point",
          title: t("Points"),
          onClick: () => handleLayerStyleAddition(pointStyle, "Points")
        },
        {
          id: "pointWithLabel",
          title: t("Point with label"),
          onClick: () =>
            handleLayerStyleAddition(pointWithLabelStyle, "Point with label")
        },
        {
          id: "polyline",
          title: t("Polyline"),
          onClick: () => handleLayerStyleAddition(polylineStyle, "Polyline")
        },
        {
          id: "polygon",
          title: t("Polygon"),
          onClick: () => handleLayerStyleAddition(polygonStyle, "Polygon")
        },
        {
          id: "threedTiles",
          title: t("3D Tiles"),
          onClick: () => handleLayerStyleAddition(threeDTilesStyle, "3D Tiles")
        },
        {
          id: "extrudedPolygon",
          title: t("Extruded polygon"),
          onClick: () =>
            handleLayerStyleAddition(extrudedPolygonStyle, "Extruded polygon")
        }
      ]
    },
    {
      id: "geometry",
      title: t("Geometry"),
      icon: "folderSimple",
      subItem: [
        {
          id: "simpleStyle",
          title: t("Simple Style"),
          onClick: () => handleLayerStyleAddition(simpleStyle, "Simple Style")
        }
      ]
    },
    {
      id: "plateau",
      title: t("Plateau"),
      icon: "folderSimple",
      subItem: [
        {
          id: "colorBuilding",
          title: t("Color buildings by height"),
          onClick: () =>
            handleLayerStyleAddition(
              colorBuildingsByHeight,
              "Color buildings by height"
            )
        }
      ]
    }
  ];

  return (
    <PopupMenu
      menu={menuItems}
      label={<IconButton icon="plus" size="large" />}
    />
  );
};

export default PresetLayerStyle;
