import TextInput from "@reearth/beta/components/properties/TextInput";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { WidgetAreaPadding, WidgetAreaState } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

type Props = {
  sceneId: string;
  widgetArea: WidgetAreaState;
};

const ContainerSettings: React.FC<Props> = ({ sceneId, widgetArea }) => {
  const { handleAreaStateChange } = useHooks({ sceneId });

  // TODO: This is dummy UI
  return (
    <Wrapper>
      <SidePanelSectionField>
        <TextInput
          name="Padding Top"
          value={widgetArea?.padding?.top.toString()}
          onChange={newVal => {
            handleAreaStateChange?.({
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
            handleAreaStateChange?.({
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
            handleAreaStateChange?.({
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
            handleAreaStateChange?.({
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
            handleAreaStateChange?.({
              ...widgetArea,
              gap: Number(newVal) ?? 0,
            });
          }}
        />

        <div>[Switch field] Align Center {!!widgetArea?.centered}</div>
        <div>[Color field] Background Color {widgetArea?.background}</div>
      </SidePanelSectionField>
    </Wrapper>
  );
};

export default ContainerSettings;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
