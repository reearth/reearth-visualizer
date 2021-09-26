import React from "react";

import { styled } from "@reearth/theme";

import { Props as WidgetProps } from "../../Widget";

import MenuButton, { Button as ButtonType, MenuItem as MenuItemType } from "./MenuButton";

export type Props = WidgetProps<Property>;
export type Button = ButtonType;
export type MenuItem = MenuItemType;
export type Property = {
  default: Button;
  menu?: MenuItem[];
};

const Menu = ({ widget, sceneProperty, widgetLayout }: Props): JSX.Element | null => {
  const { default: button, menu: menuItems } = (widget?.property as Property | undefined) ?? {};

  return button ? (
    <Wrapper>
      <MenuButton
        sceneProperty={sceneProperty}
        key={button?.id}
        button={button}
        location={widgetLayout?.location}
        align={widgetLayout?.align}
        menuItems={menuItems}
      />
    </Wrapper>
  ) : null;
};

const Wrapper = styled.div`
  padding: 5px;
  display: flex;
`;

export default Menu;
