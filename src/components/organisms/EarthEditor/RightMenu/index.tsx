import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import TabArea from "@reearth/components/atoms/TabArea";
import DatasetInfoPane from "@reearth/components/organisms/EarthEditor/DatasetInfoPane";
import ExportPane from "@reearth/components/organisms/EarthEditor/ExportPane";

import PropertyPane from "../PropertyPane";
import TagPane from "../TagPane";

import useHooks, { Tab } from "./hooks";

const layerMode = ["property", "infobox", "tag", "export"];
const widgetMode = ["property"];
const sceneMode = ["property", "tag"];
export type LayerMode = typeof layerMode[number];
export type WidgetMode = typeof widgetMode[number];
export type SceneMode = typeof sceneMode[number];
export type Mode = LayerMode | WidgetMode | SceneMode;

// TODO: ErrorBoudaryでエラーハンドリング

const RightMenu: React.FC = () => {
  const { isCapturing, selectedBlock, selectedTab, selected, reset } = useHooks();

  const intl = useIntl();
  const labels = useMemo(
    () => ({
      layer: intl.formatMessage({ defaultMessage: "Layer" }),
      widget: intl.formatMessage({ defaultMessage: "Widget" }),
      widgets: intl.formatMessage({ defaultMessage: "Widgets" }),
      scene: intl.formatMessage({ defaultMessage: "Scene" }),
      infobox: intl.formatMessage({ defaultMessage: "Infobox" }),
      tag: intl.formatMessage({ defaultMessage: "Tag" }),
      export: intl.formatMessage({ defaultMessage: "Export" }),
    }),
    [intl],
  );

  return (
    <TabArea<Tab>
      menuAlignment="top"
      selected={
        selectedBlock || selectedTab === "infobox"
          ? "infobox"
          : selectedTab === "export"
          ? "export"
          : selectedTab === "tag"
          ? "tag"
          : selected
      }
      disabled={isCapturing}
      labels={labels}
      onlyIcon
      onChange={reset}
      scrollable>
      {{
        ...(selected
          ? {
              [selected]: (
                <>
                  {selected === "layer" ? (
                    <PropertyPane mode="layer" />
                  ) : selected === "widget" ? (
                    <PropertyPane mode="widget" />
                  ) : selected === "widgets" ? (
                    <PropertyPane mode="widgets" />
                  ) : selected === "cluster" ? (
                    <>
                      <PropertyPane mode="cluster" />
                    </>
                  ) : (
                    <PropertyPane mode="scene" />
                  )}
                </>
              ),
            }
          : {}),
        infobox: selected === "layer" && (
          <>
            <PropertyPane mode="block" />
            <PropertyPane mode="infobox" />
          </>
        ),
        tag: (selected === "layer" || selected === "scene") && <TagPane mode={selected} />,
        export: (selected === "layer" || selected === "scene") && (
          <>
            <ExportPane />
          </>
        ),
        dataset: selected === "dataset" && <DatasetInfoPane />,
      }}
    </TabArea>
  );
};

export default RightMenu;
