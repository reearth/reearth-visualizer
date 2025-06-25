import { BlockContext } from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import Button from "@reearth/app/ui/widgetui/Button";
import { useVisualizer } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useContext, useMemo, useState } from "react";

import CameraEditor, { type CameraBlock as CameraBlockType } from "./Editor";

type Props = {
  propertyId?: string;
  cameraButtons: CameraBlockType[];
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
};

const Content: FC<Props> = ({
  propertyId,
  cameraButtons,
  isEditable,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove
}) => {
  const t = useT();
  const context = useContext(BlockContext);
  const visualizer = useVisualizer();
  const [selected, setSelected] = useState<string>(cameraButtons[0]?.id);

  const handleFlyTo = useMemo(
    () => visualizer.current?.engine.flyTo,
    [visualizer]
  );

  const handleClick = useCallback(
    (itemId: string) => {
      if (isEditable) {
        setSelected(itemId);
        return;
      }
      const item = cameraButtons.find((i) => i.id === itemId);
      if (!item?.cameraPosition?.value) return;
      handleFlyTo?.(item.cameraPosition?.value, {
        duration: item.cameraDuration?.value || 2
      });
    },
    [cameraButtons, isEditable, handleFlyTo]
  );

  return (
    <Wrapper>
      <ButtonWrapper>
        {cameraButtons.map(({ title, color, bgColor, id }) => {
          return (
            //The button will be updated in future
            <StyledButton
              key={id}
              color={color?.value}
              bgColor={bgColor?.value}
              icon="camera"
              buttonType="primary"
              text={title?.value ?? t("New Camera")}
              size="small"
              onClick={() => handleClick(id)}
            />
          );
        })}
      </ButtonWrapper>
      {context?.editMode && (
        <CameraEditor
          items={cameraButtons}
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
