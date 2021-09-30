import { groupBy } from "lodash-es";
import React, { useMemo } from "react";

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
    () => groupBy(buttons, v => v.buttonPosition || "topleft") as { [p in Position]: Button[] },
    [buttons],
  );

  return (
    <>
      {Object.entries(buttonsByPosition).map(([p, buttons]) =>
        buttons?.length ? (
          <Wrapper key={p} position={p as Position}>
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

const Wrapper = styled.div<{ position?: "topleft" | "topright" | "bottomleft" | "bottomright" }>`
  position: absolute;
  top: ${({ position }) => (position === "topleft" || position === "topright" ? "0" : null)};
  bottom: ${({ position }) =>
    position === "bottomleft" || position === "bottomright" ? "0" : null};
  left: ${({ position }) => (position === "topleft" || position === "bottomleft" ? "0" : null)};
  right: ${({ position }) => (position === "topright" || position === "bottomright" ? "0" : null)};
  padding: 5px;
  display: flex;
`;

export default Menu;
