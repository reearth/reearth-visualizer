import {
  IconButton,
  PopupMenu,
  PopupMenuItem
} from "@reearth/app/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { useEffect, FC, useCallback, useRef } from "react";

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
  const layerStyleAddedRef = useRef<string | undefined>(undefined);
  const t = useT();
  const handleLayerStyleAddition = useCallback(
    (value?: Record<string, unknown>, styleName?: string) => {
      const name = getLayerStyleName(
        styleName ? styleName : "Style",
        layerStyles
      );
      onLayerStyleAdd({
        name,
        value: value || {}
      });
      layerStyleAddedRef.current = name;
    },
    [layerStyles, onLayerStyleAdd]
  );

  useEffect(() => {
    if (layerStyleAddedRef.current && layerStyles) {
      const addedStyle = layerStyles.find(
        (style) => style.name === layerStyleAddedRef.current
      );
      onLayerStyleSelect(addedStyle?.id);
      layerStyleAddedRef.current = undefined;
    }
  }, [layerStyles, onLayerStyleSelect]);

  const menuItems: PopupMenuItem[] = [
    {
      id: "empty",
      title: "Empty",
      onClick: () => handleLayerStyleAddition({})
    },
    {
      id: "default",
      title: "Default",
      onClick: () => handleLayerStyleAddition(defaultStyle, "Default")
    },
    {
      id: "professional",
      title: "Professional",
      onClick: () => handleLayerStyleAddition(professionalStyle, "Professional")
    },
    {
      id: "basicGeometry",
      title: "Basic Geometry",
      icon: "folderSimple",
      subItem: [
        {
          id: "point",
          title: "Points",
          onClick: () => handleLayerStyleAddition(pointStyle, "Points")
        },
        {
          id: "pointWithLabel",
          title: "Point with label",
          onClick: () =>
            handleLayerStyleAddition(pointWithLabelStyle, "Point_with_label")
        },
        {
          id: "polyline",
          title: "Polyline",
          onClick: () => handleLayerStyleAddition(polylineStyle, "Polyline")
        },
        {
          id: "polygon",
          title: "Polygon",
          onClick: () => handleLayerStyleAddition(polygonStyle, "Polygon")
        },
        {
          id: "extrudedPolygon",
          title: "Extruded polygon",
          onClick: () =>
            handleLayerStyleAddition(extrudedPolygonStyle, "Extruded_polygon")
        },
        {
          id: "threedTiles",
          title: "3D Tiles",
          onClick: () => handleLayerStyleAddition(threeDTilesStyle, "3D_tiles")
        }
      ]
    },
    {
      id: "geojson",
      title: "GeoJSON",
      icon: "folderSimple",
      subItem: [
        {
          id: "simpleStyle",
          title: "Simple Style",
          onClick: () => handleLayerStyleAddition(simpleStyle, "Simple_style")
        }
      ]
    },
    {
      id: "plateau",
      title: "Plateau",
      icon: "folderSimple",
      subItem: [
        {
          id: "colorBuilding",
          title: "Color buildings by height",
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
      label={
        <IconButton
          icon="plus"
          size="large"
          placement="top"
          tooltipText={t("New style")}
        />
      }
    />
  );
};

export default PresetLayerStyle;
