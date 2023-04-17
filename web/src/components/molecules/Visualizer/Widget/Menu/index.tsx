import { groupBy } from "lodash-es";
import { useMemo } from "react";

import Flex from "@reearth/components/atoms/Flex";
import { styled } from "@reearth/theme";

import { ComponentProps as WidgetProps } from "../../Widget";

import MenuButton, {
  Button as ButtonType,
  Position as PositionType,
  MenuItem as MenuItemType,
} from "./MenuButton";

export type Props = WidgetProps<Property>;
export type Position = PositionType;
export type Button = ButtonType;
export type MenuItem = MenuItemType;
export type Property = {
  buttons?: Button[];
  menu?: MenuItem[];
};

const Menu = ({ widget, sceneProperty }: Props): JSX.Element => {
  const { buttons, menu: menuItems } = (widget?.property as Property | undefined) ?? {};
  const buttonsByPosition = useMemo(
    () => groupBy(buttons, v => v.buttonPosition || "topleft"),
    [buttons],
  );

  return (
    <>
      {Object.entries(buttonsByPosition).map(([p, buttons]) =>
        buttons?.length ? (
          <Wrapper key={p} position={p as Position} wrap="wrap">
            {buttons.map(b =>
              !b.buttonInvisible ? (
                <MenuButton
                  sceneProperty={sceneProperty}
                  key={b.id}
                  button={b}
                  pos={p as Position}
                  menuItems={menuItems}
                />
              ) : null,
            )}
          </Wrapper>
        ) : null,
      )}
    </>
  );
};

const Wrapper = styled(Flex)<{ position?: "topleft" | "topright" | "bottomleft" | "bottomright" }>`
  position: absolute;
  max-width: 100vw;
  padding: 2.5px;
  top: ${({ position }) => (position === "topleft" || position === "topright" ? "0" : null)};
  bottom: ${({ position }) =>
    position === "bottomleft" || position === "bottomright" ? "0" : null};
  left: ${({ position }) => (position === "topleft" || position === "bottomleft" ? "0" : null)};
  right: ${({ position }) => (position === "topright" || position === "bottomright" ? "0" : null)};
`;

export default Menu;
