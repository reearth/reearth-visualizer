import Flex from "@reearth/beta/components/Flex";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, mask } from "@reearth/services/theme";
import spacingSizes from "@reearth/services/theme/reearthTheme/common/spacing";
import { useRef, useCallback, useState } from "react";
import { usePopper } from "react-popper";

import type { Camera, FlyToDestination, Theme } from "../../types";

export type Button = {
  id: string;
  buttonType?: "menu" | "link" | "camera";
  buttonTitle?: string;
  buttonStyle?: "text" | "icon" | "texticon";
  buttonIcon?: string;
  buttonLink?: string;
  buttonColor?: string;
  buttonBgcolor?: string;
  buttonCamera?: Camera;
  visible?: "always" | "desktop" | "mobile";
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
  button?: Button;
  menuItems?: MenuItem[];
  location?: {
    section?: "left" | "right" | "center";
    area?: "top" | "middle" | "bottom";
  };
  align?: "end" | "start" | "centered";
  theme?: Theme;
  onFlyTo?: (
    target: string | FlyToDestination,
    options?: { duration?: number }
  ) => void;
};

export default function MenuButton({
  button: b,
  menuItems,
  location,
  align,
  theme,
  onFlyTo
}: Props): JSX.Element {
  const [visibleMenuButton, setVisibleMenuButton] = useState(false);

  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      placement:
        location?.area === "bottom"
          ? location?.section === "left" ||
            (location?.section === "center" && align !== "end")
            ? "top-start"
            : "top-end"
          : location?.area === "middle"
            ? location?.section === "left"
              ? align === "end"
                ? "top-start"
                : "bottom-start"
              : align === "end"
                ? "top-end"
                : "bottom-end"
            : location?.section === "right" || align === "end"
              ? "bottom-end"
              : "bottom-start",
      modifiers: [
        {
          name: "eventListeners",
          enabled: !visibleMenuButton,
          options: {
            scroll: false,
            resize: false
          }
        },
        {
          name: "offset",
          options: {
            offset: [0, 2]
          }
        }
      ]
    }
  );

  const handleClick = useCallback(
    (b: Button | MenuItem) => () => {
      const t =
        "buttonType" in b
          ? b.buttonType
          : "menuType" in b
            ? b.menuType
            : undefined;
      if (t === "menu") {
        setVisibleMenuButton(!visibleMenuButton);
        return;
      } else if (t === "camera") {
        const camera =
          "buttonCamera" in b
            ? b.buttonCamera
            : "menuCamera" in b
              ? b.menuCamera
              : undefined;
        if (camera) {
          onFlyTo?.(camera, { duration: 2 });
        }
      } else {
        let link =
          "buttonLink" in b
            ? b.buttonLink
            : "menuLink" in b
              ? b.menuLink
              : undefined;
        if (link) {
          const splitLink = link?.split("/");
          if (splitLink?.[0] !== "http:" && splitLink?.[0] !== "https:") {
            link = "https://" + link;
          }
          window.open(link, "_blank", "noopener");
        }
      }
      setVisibleMenuButton(false);
    },
    [onFlyTo, visibleMenuButton]
  );

  return (
    <Wrapper publishedTheme={theme} button={b}>
      <Button
        publishedTheme={theme}
        button={b}
        onClick={b && handleClick(b)}
        ref={referenceElement}
      >
        {(b?.buttonStyle === "icon" || b?.buttonStyle === "texticon") &&
          b?.buttonIcon && <img src={b?.buttonIcon} width={20} height={20} />}
        {b?.buttonStyle !== "icon" && (
          <Text
            size="footnote"
            customColor
            otherProperties={{
              marginLeft:
                b?.buttonIcon && b?.buttonStyle === "texticon"
                  ? "5px"
                  : undefined
            }}
          >
            {b?.buttonTitle}
          </Text>
        )}
      </Button>
      <MenuWrapper
        ref={popperElement}
        style={{ ...styles.popper }}
        {...attributes.popper}
      >
        {visibleMenuButton && (
          <MenuInnerWrapper publishedTheme={theme} button={b}>
            {menuItems?.map((i) => (
              <MenuItem
                align="center"
                publishedTheme={theme}
                key={i.id}
                item={i}
                button={b}
                onClick={handleClick(i)}
              >
                <Flex align="center">
                  {i.menuIcon && <Icon icon={i.menuIcon} size={20} />}
                  <Text
                    size="footnote"
                    customColor
                    otherProperties={{
                      marginLeft: i.menuIcon ? "5px" : undefined
                    }}
                  >
                    {i.menuTitle}
                  </Text>
                </Flex>
              </MenuItem>
            ))}
          </MenuInnerWrapper>
        )}
      </MenuWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div<{ button?: Button; publishedTheme?: Theme }>`
  border-radius: ${spacingSizes["smallest"]}px;
  &,
  > div {
    background-color: ${({ button, publishedTheme }) =>
      button?.buttonBgcolor || publishedTheme};
  }
`;

const Button = styled.div<{ button?: Button; publishedTheme?: Theme }>`
  display: flex;
  border-radius: ${spacingSizes["smallest"]}px;
  min-width: 35px;
  height: 35px;
  padding: 0 10px;
  line-height: 35px;
  box-sizing: border-box;
  color: ${({ button, publishedTheme }) =>
    button?.buttonColor || publishedTheme?.mainText};
  cursor: pointer;
  align-items: center;
  user-select: none;

  &:hover {
    background: ${({ publishedTheme, button }) =>
      mask(button?.buttonBgcolor) || publishedTheme?.mask};
  }
`;

const MenuWrapper = styled.div`
  z-index: ${({ theme }) => theme.zIndexes.visualizer.widget};
  border-radius: 3px;
  max-height: 30vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const MenuInnerWrapper = styled.div<{
  button?: Button;
  publishedTheme?: Theme;
}>`
  min-width: 35px;
  width: 100%;
  color: ${({ button, publishedTheme }) =>
    button?.buttonColor || publishedTheme?.mainText};
  white-space: nowrap;
`;

const MenuItem = styled(Flex)<{
  item?: MenuItem;
  button?: Button;
  publishedTheme?: Theme;
}>`
  min-height: ${({ item }) => (item?.menuType === "border" ? null : "25px")};
  border-radius: ${({ item }) => (item?.menuType === "border" ? null : "3px")};
  padding: ${({ item }) =>
    item?.menuType === "border" ? "0 10px" : "2px 10px"};
  cursor: ${({ item }) => (item?.menuType === "border" ? null : "pointer")};
  background: ${({ publishedTheme, item, button }) =>
    item?.menuType === "border"
      ? mask(button?.buttonBgcolor) || publishedTheme?.mask
      : null};
  border-bottom: ${({ item, publishedTheme, button }) =>
    item?.menuType === "border"
      ? `1px solid ${button?.buttonColor || publishedTheme?.weakText}`
      : null};
  user-select: none;

  &:hover {
    background: ${({ publishedTheme, item, button }) =>
      item?.menuType === "border"
        ? null
        : mask(button?.buttonBgcolor) || publishedTheme?.mask};
  }
`;
