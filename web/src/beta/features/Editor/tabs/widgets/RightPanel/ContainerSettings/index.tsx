import ColorField from "@reearth/beta/components/fields/ColorField";
import TextInput from "@reearth/beta/components/fields/TextField";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { useT } from "@reearth/services/i18n";
import { WidgetAreaPadding, WidgetAreaState } from "@reearth/services/state";

type Props = {
  widgetArea: WidgetAreaState;
  onWidgetAreaStateChange: (widgetArea: WidgetAreaState) => void;
};

const ContainerSettings: React.FC<Props> = ({ widgetArea, onWidgetAreaStateChange }) => {
  const t = useT();

  return (
    <SidePanelSectionField>
      <TextInput
        name={t("Padding top")}
        value={widgetArea?.padding?.top.toString()}
        onChange={newVal => {
          onWidgetAreaStateChange({
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
          onWidgetAreaStateChange({
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
          onWidgetAreaStateChange({
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
          onWidgetAreaStateChange({
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
          onWidgetAreaStateChange({
            ...widgetArea,
            gap: Number(newVal) ?? 0,
          });
        }}
      />
      <ToggleField
        name={t("Align centered")}
        checked={!!widgetArea?.centered}
        onChange={newVal => {
          onWidgetAreaStateChange({
            ...widgetArea,
            centered: newVal,
          });
        }}
      />
      <ColorField
        name={t("Background color")}
        value={widgetArea?.background}
        onChange={newVal => {
          onWidgetAreaStateChange({
            ...widgetArea,
            background: newVal,
          });
        }}
      />
    </SidePanelSectionField>
  );
};

export default ContainerSettings;
