import { ColorField, NumberField, SwitchField } from "@reearth/app/ui/fields";
import { Panel } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n/hooks";
import { WidgetAreaPadding } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { useWidgetsPage } from "../context";

import useHooks from "./hooks";

const ContainerSettingsPanel: FC = () => {
  const {
    sceneId,
    selectedWidgetArea: widgetArea,
    selectWidgetArea
  } = useWidgetsPage();

  const { handleWidgetAreaStateChange } = useHooks({
    sceneId,
    selectWidgetArea
  });

  const t = useT();

  return widgetArea ? (
    <Panel
      dataTestid="settings-panel"
      title={t("Container Settings")}
      alwaysOpen
      extend
    >
      <FieldsWrapper>
        <NumberField
          data-testid="padding-top-field"
          title={t("Padding top")}
          value={widgetArea?.padding?.top.toString()}
          onChangeComplete={(newVal) => {
            handleWidgetAreaStateChange({
              ...widgetArea,
              padding: {
                ...(widgetArea.padding as WidgetAreaPadding),
                top: Number(newVal)
              }
            });
          }}
        />
        <NumberField
          data-testid="padding-right-field"
          title={t("Padding right")}
          value={widgetArea?.padding?.right.toString()}
          onChangeComplete={(newVal) => {
            handleWidgetAreaStateChange({
              ...widgetArea,
              padding: {
                ...(widgetArea.padding as WidgetAreaPadding),
                right: Number(newVal)
              }
            });
          }}
        />
        <NumberField
          data-testid="padding-bottom-field"
          title={t("Padding bottom")}
          value={widgetArea?.padding?.bottom.toString()}
          onChangeComplete={(newVal) => {
            handleWidgetAreaStateChange({
              ...widgetArea,
              padding: {
                ...(widgetArea.padding as WidgetAreaPadding),
                bottom: Number(newVal)
              }
            });
          }}
        />
        <NumberField
          data-testid="padding-left-field"
          title={t("Padding left")}
          value={widgetArea?.padding?.left.toString()}
          onChangeComplete={(newVal) => {
            handleWidgetAreaStateChange({
              ...widgetArea,
              padding: {
                ...(widgetArea.padding as WidgetAreaPadding),
                left: Number(newVal)
              }
            });
          }}
        />

        <NumberField
          data-testid="gap-spacing-field"
          title={t("Gap spacing")}
          value={(widgetArea?.gap ?? 6).toString()}
          onChangeComplete={(newVal) => {
            handleWidgetAreaStateChange({
              ...widgetArea,
              gap: Number(newVal)
            });
          }}
        />
        <SwitchField
          data-testid="align-centered-field"
          title={t("Align centered")}
          value={!!widgetArea?.centered}
          onChange={(newVal) => {
            handleWidgetAreaStateChange({
              ...widgetArea,
              centered: newVal
            });
          }}
        />
        <ColorField
          data-testid="background-color-field"
          title={t("Background color")}
          value={widgetArea?.background}
          onChange={(newVal) => {
            handleWidgetAreaStateChange({
              ...widgetArea,
              background: newVal
            });
          }}
        />
      </FieldsWrapper>
    </Panel>
  ) : null;
};

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));

export default ContainerSettingsPanel;
