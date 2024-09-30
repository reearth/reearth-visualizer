import {
  IconButton,
  PopupMenu,
  PopupMenuItem
} from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { useState, useEffect, FC, useCallback } from "react";

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
  getLayerStyleName
} from "./presetLayerStyles";

type PresetLayerStyleProps = {
  layerStyles: LayerStyle[] | undefined;
  onLayerStyleAdd: (inp: LayerStyleAddProps) => void;
  onLayerStyleSelect: (id: string | undefined) => void;
};

const PresetLayerStyle: FC<PresetLayerStyleProps> = ({
  layerStyles,
  onLayerStyleAdd,
  onLayerStyleSelect
}) => {
  const t = useT();
  const [layerStyleAdded, setLayerStyleAdded] = useState<string | undefined>(
    undefined
  );

  const handleLayerStyleAddition = useCallback(
    (value?: Record<string, unknown>, styleName?: string) => {
      const name = getLayerStyleName(
        styleName ? styleName : t("Style"),
        layerStyles
      );
      onLayerStyleAdd({
        name,
        value: value || {}
      });
      setLayerStyleAdded(name);
    },
    [t, layerStyles, onLayerStyleAdd]
  );

  useEffect(() => {
    if (layerStyleAdded && layerStyles) {
      const addedStyle = layerStyles.find(
        (style) => style.name === layerStyleAdded
      );
      onLayerStyleSelect(addedStyle?.id);
    }
  }, [layerStyles, onLayerStyleSelect, layerStyleAdded]);

  const menuItems: PopupMenuItem[] = [
    {
      id: "empty",
      title: t("Empty"),
      onClick: () => handleLayerStyleAddition({})
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
            handleLayerStyleAddition(pointWithLabelStyle, "Point_with_label")
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
          id: "extrudedPolygon",
          title: t("Extruded polygon"),
          onClick: () =>
            handleLayerStyleAddition(extrudedPolygonStyle, "Extruded_polygon")
        },
        {
          id: "threedTiles",
          title: t("3D Tiles"),
          onClick: () => handleLayerStyleAddition(threeDTilesStyle, "3D_tiles")
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
          onClick: () => handleLayerStyleAddition(simpleStyle, "Simple_style")
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
              "Color_buildings_by_height"
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
