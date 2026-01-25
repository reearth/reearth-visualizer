import { BlockContext } from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import Button from "@reearth/app/ui/widgetui/Button";
import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useContext, useState } from "react";

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
    vt?: ValueType,
    v?: ValueTypes[ValueType]
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
  linkButtons,
  isEditable,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove
}) => {
  const t = useT();
  const blockContext = useContext(BlockContext);
  const [selected, setSelected] = useState<string>(linkButtons[0]?.id);

  const handleClick = useCallback(
    (itemId: string) => {
      if (isEditable) {
        setSelected(itemId);
        return;
      }
      const item = linkButtons.find((i) => i.id === itemId);

      if (!item?.url?.value) return;
      window.open(item.url.value, "_blank");
    },
    [isEditable, linkButtons]
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
              icon="linkSimple"
              buttonType="primary"
              text={title?.value ?? t("New Link Button")}
              size="small"
              onClick={() => handleClick(id)}
            />
          );
        })}
      </ButtonWrapper>
      {blockContext?.editMode && (
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
