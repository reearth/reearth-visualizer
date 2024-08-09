import { FC, useCallback, useContext, useState } from "react";

import Button from "@reearth/beta/components/Button";
import { BlockContext } from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import LinkEditor, { type LinkBlock as LinkBlockType } from "./Editor";

type Props = {
  propertyId?: string;
  linkButtons: LinkBlockType[];
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

const Content: FC<Props> = ({
  propertyId,
  linkButtons,
  isEditable,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove,
}) => {
  const t = useT();
  const context = useContext(BlockContext);
  const [selected, setSelected] = useState<string>(linkButtons[0]?.id);

  const handleClick = useCallback(
    (itemId: string) => {
      if (isEditable) {
        setSelected(itemId);
        return;
      }
    },
    [isEditable],
  );

  return (
    <Wrapper>
      <ButtonWrapper>
        {linkButtons.map(({ title, color, bgColor, id }) => {
          return (
            //The button will be updated in future
            <StyledButton
              key={id}
              color={color?.value}
              bgColor={bgColor?.value}
              icon="linkButtonStoryBlock"
              buttonType="primary"
              text={title?.value ?? t("New Link Button")}
              size="small"
              onClick={() => handleClick(id)}
            />
          );
        })}
      </ButtonWrapper>
      {context?.editMode && (
        <LinkEditor
          items={linkButtons}
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
  width: "100%",
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing.smallest,
  maxWidth: "400px",
}));

const StyledButton = styled(Button)<{ color?: string; bgColor?: string }>(({ color, bgColor }) => ({
  color: color || color,
  background: bgColor || bgColor,
  borderColor: color || color,
  ["&:hover"]: {
    color: bgColor || bgColor,
    background: color ? color : "inherit",
  },
}));
