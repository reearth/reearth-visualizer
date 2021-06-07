import React, { useState, useCallback, useMemo, useRef } from "react";
import { ScreenSpaceEvent, ScreenSpaceEventHandler } from "resium";
import { ScreenSpaceEventType } from "cesium";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";

import { Camera } from "@reearth/util/value";
import { styled } from "@reearth/theme";
import { useFlyTo } from "@reearth/util/use-fly-to";
import Icon from "@reearth/components/atoms/Icon";
import { WidgetComponent } from "../../PluginWidget";
import { PluginProperty } from ".";
import fonts from "@reearth/theme/fonts";

type Position = "topleft" | "topright" | "bottomleft" | "bottomright";

type Button = {
  id: string;
  buttonInvisible?: boolean;
  buttonType?: "menu" | "link" | "camera";
  buttonTitle?: string;
  buttonPosition?: Position;
  buttonStyle?: "text" | "icon" | "texticon";
  buttonIcon?: string;
  buttonLink?: string;
  buttonColor?: string;
  buttonBgcolor?: string;
  buttonCamera?: Camera;
};

type MenuItem = {
  id: string;
  menuTitle?: string;
  menuIcon?: string;
  menuType?: "link" | "camera" | "border";
  menuLink?: string;
  menuCamera?: Camera;
};

export type Property = {
  buttons?: Button[];
  menu?: MenuItem[];
};

const pos = ["topleft", "topright", "bottomleft", "bottomright"] as const;

const Menu: WidgetComponent<Property, PluginProperty> = ({ property }) => {
  const menuItems = property?.menu;
  const buttons = useMemo(
    () =>
      property?.buttons?.reduce<{
        topleft: Button[];
        topright: Button[];
        bottomleft: Button[];
        bottomright: Button[];
      }>(
        (a, b) => ({
          topleft: [
            ...a.topleft,
            ...(b.buttonPosition === "topleft" || !b.buttonPosition ? [b] : []),
          ],
          topright: [...a.topright, ...(b.buttonPosition === "topright" ? [b] : [])],
          bottomleft: [...a.bottomleft, ...(b.buttonPosition === "bottomleft" ? [b] : [])],
          bottomright: [...a.bottomright, ...(b.buttonPosition === "bottomright" ? [b] : [])],
        }),
        { topleft: [], topright: [], bottomleft: [], bottomright: [] },
      ),
    [property],
  );

  const [visibleMenuButton, setVisibleMenuButton] = useState<string>();
  const [camera, setCamera] = useState<Camera>();
  useFlyTo(camera, {
    duration: 5000,
  });

  const handleClick = useCallback(
    (b: Button | MenuItem) => () => {
      const t = "buttonType" in b ? b.buttonType : "menuType" in b ? b.menuType : undefined;
      if (t === "menu") {
        setVisibleMenuButton(v => (v === b.id ? undefined : b.id));
        return;
      } else if (t === "camera") {
        const camera =
          "buttonCamera" in b ? b.buttonCamera : "menuCamera" in b ? b.menuCamera : undefined;
        setCamera(camera);
      } else {
        let link = "buttonLink" in b ? b.buttonLink : "menuLink" in b ? b.menuLink : undefined;
        const splitLink = link?.split("/");
        if (splitLink?.[0] !== "http:" && splitLink?.[0] !== "https:") {
          link = "https://" + link;
        }
        window.open(link, "_blank", "noopener");
      }
      setVisibleMenuButton(undefined);
    },
    [],
  );

  const closeMenu = useCallback(() => {
    setVisibleMenuButton(undefined);
  }, []);

  return (
    <>
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent
          type={ScreenSpaceEventType.LEFT_CLICK}
          action={() => setVisibleMenuButton(undefined)}
        />
      </ScreenSpaceEventHandler>
      {pos.map(p => (
        <Wrapper key={p} position={p}>
          {buttons?.[p].map(b =>
            !b.buttonInvisible ? (
              <MenuButton
                key={b.id}
                button={b}
                pos={p}
                menuVisible={visibleMenuButton === b.id}
                menuItems={menuItems}
                itemOnClick={handleClick}
                onClick={handleClick(b)}
                onClose={closeMenu}
              />
            ) : null,
          )}
        </Wrapper>
      ))}
    </>
  );
};

const MenuButton: React.FC<{
  button: Button;
  menuVisible?: boolean;
  menuItems?: MenuItem[];
  itemOnClick?: (b: Button | MenuItem) => () => void;
  pos: Position;
  onClick?: () => void;
  onClose?: () => void;
}> = ({ button: b, menuVisible, menuItems, itemOnClick, pos, onClick, onClose }) => {
  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const menuElement = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(referenceElement.current, popperElement.current, {
    placement:
      pos === "topleft"
        ? "bottom-start"
        : pos === "topright"
        ? "bottom-end"
        : pos === "bottomleft"
        ? "top-start"
        : "top-end",
    strategy: "fixed",
    modifiers: [
      {
        name: "eventListeners",
        enabled: !menuVisible,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useClickAway(menuElement, onClose ?? (() => {}));

  return (
    <>
      <Button tabIndex={0} button={b} onClick={onClick} ref={referenceElement}>
        {b.buttonIcon && (
          <StyledIcon
            icon={b.buttonIcon}
            size={20}
            margin={b.buttonStyle !== "icon" && !!b.buttonTitle}
          />
        )}
        {b.buttonStyle !== "icon" && b.buttonTitle}
      </Button>
      <div
        ref={popperElement}
        style={{ ...styles.popper, display: menuVisible ? styles.popper.display : "none" }}
        {...attributes}>
        {menuVisible && (
          <MenuWrapper ref={menuElement}>
            {menuItems?.map(i => (
              <MenuItem tabIndex={0} key={i.id} item={i} onClick={itemOnClick?.(i)}>
                {i.menuType !== "border" && i.menuTitle}
              </MenuItem>
            ))}
          </MenuWrapper>
        )}
      </div>
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

const Button = styled.div<{ button?: Button }>`
  display: block;
  border-radius: 3px;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  font-size: ${fonts.sizes["2xs"]}px;
  line-height: 32px;
  box-sizing: border-box;
  background-color: ${({ button }) => button?.buttonBgcolor || "#2B2A2F"};
  color: ${({ button }) => button?.buttonColor || "#fff"};
  cursor: pointer;
  margin-left: 5px;
  user-select: none;

  &:first-of-type {
    margin-left: 0;
  }
`;

const StyledIcon = styled(Icon)<{ margin: boolean }>`
  vertical-align: middle;
  margin-right: ${({ margin }) => (margin ? "5px" : null)};
`;

const MenuWrapper = styled.div<{ visible?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  background-color: #2b2a2f;
`;

const MenuItem = styled.a<{ item?: MenuItem }>`
  display: block;
  font-size: ${fonts.sizes.xs}px;
  margin: ${({ item }) => (item?.menuType === "border" ? "0 5px" : null)};
  padding: ${({ item }) => (item?.menuType === "border" ? null : "5px 20px")};
  cursor: ${({ item }) => (item?.menuType === "border" ? null : "pointer")};
  border-top: ${({ item }) => (item?.menuType === "border" ? "1px solid #fff" : null)};
  opacity: ${({ item }) => (item?.menuType === "border" ? "0.5" : null)};
`;

export default Menu;
