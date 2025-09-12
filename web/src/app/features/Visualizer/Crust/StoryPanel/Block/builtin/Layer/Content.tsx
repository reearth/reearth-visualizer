import { BlockContext } from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import { useBlockContext } from "@reearth/app/features/Visualizer/shared/contexts/blockContext";
import Button from "@reearth/app/ui/widgetui/Button";
import type { NLSLayer } from "@reearth/services/api/layer";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useContext, useState } from "react";

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
    v?: any
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
  nlsLayers?: NLSLayer[];
};

const Content: FC<Props> = ({
  propertyId,
  layerButtons,
  isEditable,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove,
  nlsLayers
}) => {
  const t = useT();
  const [selected, setSelected] = useState<string>(layerButtons[0]?.id);

  const context = useContext(BlockContext);

  const blockContext = useBlockContext();

  const handleClick = useCallback(
    (itemId: string) => {
      if (isEditable) {
        setSelected(itemId);
        return;
      }
      const item = layerButtons.find((i) => i.id === itemId);

      if (!item?.showLayers?.value) return;

      blockContext?.onLayerOverride?.(item.id, item.showLayers.value);
    },
    [isEditable, layerButtons, blockContext]
  );

  return (
    <Wrapper>
      <ButtonWrapper>
        {layerButtons.map(({ title, color, bgColor, id }) => {
          const userSelected = id === blockContext.layerOverride?.extensionId;
          const buttonText = title?.value ?? t("New Layers Button");
          return (
            //will to be updated in future
            <StyledButton
              key={id}
              color={color?.value}
              bgColor={bgColor?.value}
              userSelected={userSelected}
              icon="layers"
              buttonType="primary"
              text={buttonText}
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
          nlsLayers={nlsLayers}
        />
      )}
    </Wrapper>
  );
};

export default Content;

const Wrapper = styled("div")(() => ({
  width: "100%"
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing.smallest,
  maxWidth: "400px"
}));

const StyledButton = styled(Button)<{
  color?: string;
  bgColor?: string;
  userSelected?: boolean;
}>(({ color, bgColor, userSelected, theme }) => ({
  color: userSelected ? (bgColor ?? theme.content.strong) : color,
  backgroundColor: userSelected ? (color ?? theme.primary.main) : bgColor,
  borderColor: color,

  ":hover": {
    color: bgColor,
    backgroundColor: color ?? theme.primary.main
  }
}));
