import { useCallback, useContext, useState } from "react";

import Button from "@reearth/beta/components/Button";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { BlockContext } from "../common/Wrapper";

import LayerEditor, { type LayerBlock as LayerBlockType } from "./Editor";

type Props = {
  propertyId?: string;
  layerButtons: LayerBlockType[];
  isEditable?: boolean;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
  ) => Promise<void>;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

const Content: React.FC<Props> = ({
  propertyId,
  layerButtons,
  isEditable,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove,
}) => {
  const t = useT();
  const context = useContext(BlockContext);
  const visualizer = useVisualizer();
  const [selected, setSelected] = useState<string>(layerButtons[0]?.id);

  const handleClick = useCallback(
    (itemId: string) => {
      if (isEditable) {
        setSelected(itemId);
        return;
      }
      const item = layerButtons.find(i => i.id === itemId);

      if (!item?.showLayers?.value) return;

      // Hide all layers
      const layers = visualizer.current?.layers;

      // Show only selected layers
      layers?.show(...item.showLayers.value);
      const allLayers = layers?.layers() ?? [];

      // Hide the rest
      layers?.hide(
        ...allLayers.map(({ id }) => id).filter(id => !item.showLayers?.value?.includes(id)),
      );
    },
    [isEditable, visualizer, layerButtons],
  );

  return (
    <Wrapper>
      <ButtonWrapper>
        {layerButtons.map(({ title, color, bgColor, id }) => {
          return (
            <StyledButton
              key={id}
              color={color?.value}
              bgColor={bgColor?.value}
              icon="showLayersStoryBlock"
              buttonType="primary"
              text={title?.value ?? t("New Layers Button")}
              size="small"
              onClick={() => handleClick(id)}
            />
          );
        })}
      </ButtonWrapper>
      {context?.editMode && (
        <LayerEditor
          items={layerButtons}
          propertyId={propertyId}
          selected={selected}
          setSelected={setSelected}
          onPropertyUpdate={onPropertyUpdate}
          onPropertyItemAdd={onPropertyItemAdd}
          onPropertyItemMove={onPropertyItemMove}
          onPropertyItemDelete={onPropertyItemDelete}
        />
      )}
    </Wrapper>
  );
};

export default Content;

const Wrapper = styled.div`
  width: 100%;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 4px;
  max-width: 400px;
  flex-wrap: wrap;
`;

const StyledButton = styled(Button)<{ color?: string; bgColor?: string }>`
  color: ${({ color }) => color};
  background-color: ${({ bgColor }) => bgColor};
  border-color: ${({ color }) => color};

  &:hover {
    color: ${({ bgColor }) => bgColor};
    background-color: ${({ color }) => color};
  }
`;
