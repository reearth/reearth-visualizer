import { FC } from "react";

import ColorField from "@reearth/beta/components/fields/ColorField";
import TextInput from "@reearth/beta/components/fields/TextField";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";
import { WidgetAreaPadding } from "@reearth/services/state";

import { useWidgetsPage } from "../context";

import useHooks from "./hooks";

const ContainerSettingsPanel: FC = () => {
  const { sceneId, selectedWidgetArea: widgetArea, setSelectedWidgetArea } = useWidgetsPage();

  const { handleWidgetAreaStateChange } = useHooks({ sceneId, setSelectedWidgetArea });

  const t = useT();

  return widgetArea ? (
    <Panel title={t("Container Settings")} alwaysOpen extend>
      <TextInput
        name={t("Padding top")}
        value={widgetArea?.padding?.top.toString()}
        onChange={newVal => {
          handleWidgetAreaStateChange({
            ...widgetArea,
            padding: {
              ...(widgetArea.padding as WidgetAreaPadding),
              top: Number(newVal) ?? 0,
            },
          });
        }}
      />
      <TextInput
        name={t("Padding right")}
        value={widgetArea?.padding?.right.toString()}
        onChange={newVal => {
          handleWidgetAreaStateChange({
            ...widgetArea,
            padding: {
              ...(widgetArea.padding as WidgetAreaPadding),
              right: Number(newVal) ?? 0,
            },
          });
        }}
      />
      <TextInput
        name={t("Padding bottom")}
        value={widgetArea?.padding?.bottom.toString()}
        onChange={newVal => {
          handleWidgetAreaStateChange({
            ...widgetArea,
            padding: {
              ...(widgetArea.padding as WidgetAreaPadding),
              bottom: Number(newVal) ?? 0,
            },
          });
        }}
      />
      <TextInput
        name={t("Padding left")}
        value={widgetArea?.padding?.left.toString()}
        onChange={newVal => {
          handleWidgetAreaStateChange({
            ...widgetArea,
            padding: {
              ...(widgetArea.padding as WidgetAreaPadding),
              left: Number(newVal) ?? 0,
            },
          });
        }}
      />

      <TextInput
        name={t("Gap spacing")}
        value={(widgetArea?.gap ?? 6).toString()}
        onChange={newVal => {
          handleWidgetAreaStateChange({
            ...widgetArea,
            gap: Number(newVal) ?? 0,
          });
        }}
      />
      <ToggleField
        name={t("Align centered")}
        checked={!!widgetArea?.centered}
        onChange={newVal => {
          handleWidgetAreaStateChange({
            ...widgetArea,
            centered: newVal,
          });
        }}
      />
      <ColorField
        name={t("Background color")}
        value={widgetArea?.background}
        onChange={newVal => {
          handleWidgetAreaStateChange({
            ...widgetArea,
            background: newVal,
          });
        }}
      />
    </Panel>
  ) : null;
};

export default ContainerSettingsPanel;
