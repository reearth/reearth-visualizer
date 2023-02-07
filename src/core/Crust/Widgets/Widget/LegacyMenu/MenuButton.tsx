import { ScreenSpaceEventType } from "cesium";
import { useRef, useCallback, useState } from "react";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";
import { ScreenSpaceEvent, ScreenSpaceEventHandler } from "resium";

import Icon from "@reearth/components/atoms/Icon";
import { fonts, styled } from "@reearth/theme";
import { Camera } from "@reearth/util/value";

import type { FlyToDestination, Theme } from "../types";

export type Position = "topleft" | "topright" | "bottomleft" | "bottomright";

export type Button = {
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

export type MenuItem = {
  id: string;
  menuTitle?: string;
  menuIcon?: string;
  menuType?: "link" | "camera" | "border";
  menuLink?: string;
  menuCamera?: Camera;
};

export type Props = {
  button: Button;
  menuItems?: MenuItem[];
  pos: Position;
  theme?: Theme;
  onFlyTo?: (target: string | FlyToDestination, options?: { duration?: number }) => void;
};

export default function MenuButton({
  button: b,
  menuItems,
  pos,
  theme,
  onFlyTo: flyTo,
}: Props): JSX.Element {
  const [visibleMenuButton, setVisibleMenuButton] = useState<string>();

  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
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
        enabled: !visibleMenuButton,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });

  const handleClick = useCallback(
    (b: Button | MenuItem) => () => {
      const t = "buttonType" in b ? b.buttonType : "menuType" in b ? b.menuType : undefined;
      if (t === "menu") {
        setVisibleMenuButton(v => (v === b.id ? undefined : b.id));
        return;
      }
      setVisibleMenuButton(undefined);

      if (t === "camera") {
        const camera =
          "buttonCamera" in b ? b.buttonCamera : "menuCamera" in b ? b.menuCamera : undefined;
        if (camera) {
          flyTo?.(camera, { duration: 2 });
        }
        return;
      }

      let link = "buttonLink" in b ? b.buttonLink : "menuLink" in b ? b.menuLink : undefined;
      if (!link) return;

      const splitLink = link?.split("/");
      if (splitLink?.[0] !== "http:" && splitLink?.[0] !== "https:") {
        link = "https://" + link;
      }
      window.open(link, "_blank", "noopener");
    },
    [flyTo],
  );

  const wrappperRef = useRef<HTMLDivElement>(null);
  useClickAway(wrappperRef, () => setVisibleMenuButton(undefined));

  return (
    <Wrapper ref={wrappperRef}>
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent
          type={ScreenSpaceEventType.LEFT_CLICK}
          action={() => setVisibleMenuButton(undefined)}
        />
      </ScreenSpaceEventHandler>
      <Button
        publishedTheme={theme}
        tabIndex={0}
        button={b}
        onClick={handleClick(b)}
        ref={referenceElement}>
        {(b.buttonStyle === "icon" || b.buttonStyle === "texticon") && b.buttonIcon && (
          <StyledIcon icon={b.buttonIcon} size={25} margin={!!b.buttonTitle} />
        )}
        {b.buttonStyle !== "icon" && b.buttonTitle}
      </Button>
      <div
        ref={popperElement}
        style={{
          minWidth: "200px",
          width: "100%",
          position: "absolute",
          display: visibleMenuButton ? styles.popper.display : "none",
        }}
        {...attributes}>
        {visibleMenuButton && (
          <MenuWrapper background={theme?.background}>
            {menuItems?.map(i => (
              <MenuItem
                color={theme?.mainText}
                tabIndex={0}
                key={i.id}
                item={i}
                onClick={handleClick(i)}>
                {i.menuType !== "border" && i.menuTitle}
              </MenuItem>
            ))}
          </MenuWrapper>
        )}
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  padding: 2.5px;
  &:first-of-type {
    margin-left: 0;
  }
`;

const StyledIcon = styled(Icon)<{ margin: boolean }>`
  vertical-align: middle;
  margin-right: ${({ margin }) => (margin ? "5px" : null)};
`;

const MenuWrapper = styled.div<{ background?: string }>`
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${({ background }) => background};
  border-radius: 3px;
  overflow-wrap: break-word;
  hyphens: auto;
`;

const MenuItem = styled.a<{ item?: MenuItem; color?: string }>`
  display: block;
  font-size: ${fonts.sizes.xs}px;
  margin: ${({ item }) => (item?.menuType === "border" ? "0 5px" : null)};
  padding: ${({ item }) => (item?.menuType === "border" ? null : "5px 20px")};
  cursor: ${({ item }) => (item?.menuType === "border" ? null : "pointer")};
  border-top: ${({ item }) => (item?.menuType === "border" ? "1px solid #fff" : null)};
  opacity: ${({ item }) => (item?.menuType === "border" ? "0.5" : null)};
  color: ${({ color }) => color};
`;

const Button = styled.div<{ button?: Button; publishedTheme?: Theme }>`
  display: flex;
  border-radius: 3px;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  font-size: ${fonts.sizes["2xs"]}px;
  line-height: 32px;
  box-sizing: border-box;
  background-color: ${({ button, publishedTheme }) =>
    button?.buttonBgcolor || publishedTheme?.background};
  color: ${({ button, publishedTheme }) => button?.buttonColor || publishedTheme?.mainText};
  cursor: pointer;
  align-items: center;
  user-select: none;
`;
