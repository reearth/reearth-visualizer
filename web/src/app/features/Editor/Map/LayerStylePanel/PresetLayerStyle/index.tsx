import {
  IconButton,
  PopupMenu,
  PopupMenuItem
} from "@reearth/app/lib/reearth-ui";
import type { LayerStyle } from "@reearth/services/api/layerStyle";
import { useLang, useT } from "@reearth/services/i18n/hooks";
import { useEffect, FC, useCallback, useRef, useMemo } from "react";

import { LayerStyleAddProps } from "../../../hooks/useLayerStyles";

import {
  basicGeometryPresets,
  geojsonPresets,
  professionalStyle,
  defaultStyle,
  plateauPresets
} from "./presets";
import type { PresetStyle, PresetStyleCategory } from "./presets/types";
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
  const lang = useLang();
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

  // Configuration for preset menu items
  const presetConfigs: (
    | { type: "empty" }
    | { type: "simple"; preset: PresetStyle }
    | { type: "category"; preset: PresetStyleCategory }
  )[] = useMemo(
    () => [
      { type: "empty" },
      { type: "simple", preset: defaultStyle },
      { type: "simple", preset: professionalStyle },
      { type: "category", preset: basicGeometryPresets },
      { type: "category", preset: geojsonPresets },
      { type: "category", preset: plateauPresets }
    ],
    []
  );

  // Convert preset config to PopupMenuItem
  const createMenuItem = useCallback(
    (
      config:
        | { type: "empty" }
        | { type: "simple"; preset: PresetStyle }
        | { type: "category"; preset: PresetStyleCategory }
    ): PopupMenuItem => {
      if (config.type === "empty") {
        return {
          id: "empty",
          title: "Empty",
          onClick: () => handleLayerStyleAddition({}),
          dataTestid: "preset-style-empty"
        };
      }

      if (config.type === "simple") {
        const preset = config.preset;
        return {
          id: preset.id,
          title:
            lang === "ja" && preset.titleJa ? preset.titleJa : preset.title,
          onClick: () =>
            handleLayerStyleAddition(
              preset.style,
              lang === "ja" && preset.titleJa ? preset.titleJa : preset.title
            ),
          dataTestid: preset.testId
        };
      }

      // type === "category"
      const category = config.preset;
      return {
        id: category.id,
        title: category.title,
        icon: "folderSimple",
        dataTestid: category.testId,
        subItem: category.subs.map((sub) => ({
          id: sub.id,
          title: lang === "ja" && sub.titleJa ? sub.titleJa : sub.title,
          onClick: () =>
            handleLayerStyleAddition(
              sub.style,
              lang === "ja" && sub.titleJa ? sub.titleJa : sub.title
            ),
          dataTestid: sub.testId
        }))
      };
    },
    [handleLayerStyleAddition, lang]
  );

  const menuItems: PopupMenuItem[] = useMemo(
    () => presetConfigs.map(createMenuItem),
    [presetConfigs, createMenuItem]
  );

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
