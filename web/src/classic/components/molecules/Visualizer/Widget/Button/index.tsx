import { styled } from "@reearth/services/theme";

import { ComponentProps as WidgetProps } from "..";
import { useVisible } from "../useVisible";

import MenuButton, { Button as ButtonType, MenuItem as MenuItemType } from "./MenuButton";

export type Props = WidgetProps<Property>;
export type Button = ButtonType;
export type MenuItem = MenuItemType;
export type Property = {
  default?: Button;
  menu?: MenuItem[];
};

const Menu = ({
  widget,
  sceneProperty,
  viewport,
  onVisibilityChange,
}: Props): JSX.Element | null => {
  const { default: button, menu: menuItems } = (widget.property as Property) ?? {};

  const visible = useVisible({
    widgetId: widget.id,
    visible: widget.property?.default?.visible,
    isMobile: viewport?.isMobile,
    onVisibilityChange,
  });

  return visible ? (
    <Wrapper>
      <MenuButton
        sceneProperty={sceneProperty}
        button={button}
        location={widget.layout?.location}
        align={widget.layout?.align}
        menuItems={menuItems}
      />
    </Wrapper>
  ) : null;
};

const Wrapper = styled.div`
  display: flex;
`;

export default Menu;
