import { styled } from "@reearth/theme";

import type { ComponentProps as WidgetProps } from "..";

import MenuButton, { Button as ButtonType, MenuItem as MenuItemType } from "./MenuButton";

export type Props = WidgetProps<Property>;
export type Button = ButtonType;
export type MenuItem = MenuItemType;
export type Property = {
  default?: Button;
  menu?: MenuItem[];
};

const Menu = ({ widget, theme, context: { onFlyTo } = {} }: Props): JSX.Element | null => {
  const { default: button, menu: menuItems } = widget.property ?? {};

  return (
    <Wrapper>
      <MenuButton
        theme={theme}
        button={button}
        location={widget.layout?.location}
        align={widget.layout?.align}
        menuItems={menuItems}
        onFlyTo={onFlyTo}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
`;

export default Menu;
