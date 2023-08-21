import TextInput from "@reearth/beta/components/Fields/TextInput";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { WidgetAreaPadding, WidgetAreaState } from "@reearth/services/state";

type Props = {
  widgetArea: WidgetAreaState;
  onWidgetAreaStateChange: (widgetArea: WidgetAreaState) => void;
};

const ContainerSettings: React.FC<Props> = ({ widgetArea, onWidgetAreaStateChange }) => {
  // TODO: This is dummy UI
  return (
    <SidePanelSectionField>
      <TextInput
        name="Padding Top"
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
        name="Padding Right"
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
        name="Padding Bottom"
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
        name="Padding Left"
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
        name="Gap Spacing"
        value={(widgetArea?.gap ?? 0).toString()}
        onChange={newVal => {
          onWidgetAreaStateChange({
            ...widgetArea,
            gap: Number(newVal) ?? 0,
          });
        }}
      />

      <div>[Switch field] Align Center {!!widgetArea?.centered}</div>
      <div>[Color field] Background Color {widgetArea?.background}</div>
    </SidePanelSectionField>
  );
};

export default ContainerSettings;
