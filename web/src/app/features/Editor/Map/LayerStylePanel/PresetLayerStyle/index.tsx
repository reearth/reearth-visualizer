import {
  IconButton,
  PopupMenu,
  PopupMenuItem
} from "@reearth/app/lib/reearth-ui";
import type { LayerStyle } from "@reearth/services/api/layerStyle";
import { useT } from "@reearth/services/i18n/hooks";
import { useEffect, FC, useCallback, useRef } from "react";

import { LayerStyleAddProps } from "../../../hooks/useLayerStyles";

import {
  basicGeometryPresets,
  geojsonPresets,
  professionalStyle,
  defaultStyle,
  plateauPresets
} from "./presets";
import { getLayerStyleName } from "./utils";

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
      onClick: () => handleLayerStyleAddition({}),
      dataTestid: "preset-style-empty"
    },
    {
      id: defaultStyle.id,
      title: defaultStyle.title,
      onClick: () =>
        handleLayerStyleAddition(defaultStyle.style, defaultStyle.title),
      dataTestid: defaultStyle.testId
    },
    {
      id: professionalStyle.id,
      title: professionalStyle.title,
      onClick: () =>
        handleLayerStyleAddition(
          professionalStyle.style,
          professionalStyle.title
        ),
      dataTestid: professionalStyle.testId
    },
    {
      id: basicGeometryPresets.id,
      title: basicGeometryPresets.title,
      icon: "folderSimple",
      dataTestid: basicGeometryPresets.testId,
      subItem: basicGeometryPresets.subs.map((sub) => ({
        id: sub.id,
        title: sub.title,
        onClick: () => handleLayerStyleAddition(sub.style, sub.title),
        dataTestid: sub.testId
      }))
    },
    {
      id: geojsonPresets.id,
      title: geojsonPresets.title,
      icon: "folderSimple",
      dataTestid: geojsonPresets.testId,
      subItem: geojsonPresets.subs.map((sub) => ({
        id: sub.id,
        title: sub.title,
        onClick: () => handleLayerStyleAddition(sub.style, sub.title),
        dataTestid: sub.testId
      }))
    },
    {
      id: plateauPresets.id,
      title: plateauPresets.title,
      icon: "folderSimple",
      dataTestid: plateauPresets.testId,
      subItem: plateauPresets.subs.map((sub) => ({
        id: sub.id,
        title: sub.title,
        onClick: () => handleLayerStyleAddition(sub.style, sub.title),
        dataTestid: sub.testId
      }))
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
