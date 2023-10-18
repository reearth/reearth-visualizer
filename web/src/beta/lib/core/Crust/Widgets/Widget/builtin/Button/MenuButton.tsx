import { useRef, useCallback, useState } from "react";
import { usePopper } from "react-popper";

import Flex from "@reearth/beta/components/Flex";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import type { Field } from "@reearth/beta/lib/core/StoryPanel/types";
import { styled, metricsSizes, mask } from "@reearth/services/theme";

import type { Camera, FlyToDestination, Theme } from "../../types";
import { Visible } from "../../useVisible";

export type Button = {
  id: string;
  buttonType?: Field<"menu" | "link" | "camera">;
  buttonTitle?: Field<string>;
  buttonStyle?: Field<"text" | "icon" | "texticon">;
  buttonIcon?: Field<string>;
  buttonLink?: Field<string>;
  buttonColor?: Field<string>;
  buttonBgcolor?: Field<string>;
  buttonCamera?: Field<Camera>;
  visible: Field<Visible>;
};

export type MenuItem = {
  id: string;
  menuTitle?: Field<string>;
  menuIcon?: Field<string>;
  menuType?: Field<"link" | "camera" | "border">;
  menuLink?: Field<string>;
  menuCamera?: Field<Camera>;
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
  onFlyTo?: (target: string | FlyToDestination, options?: { duration?: number }) => void;
};

export default function MenuButton({
  button: b,
  menuItems,
  location,
  align,
  theme,
  onFlyTo,
}: Props): JSX.Element {
  const [visibleMenuButton, setVisibleMenuButton] = useState(false);

  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(referenceElement.current, popperElement.current, {
    placement:
      location?.area === "bottom"
        ? location?.section === "left" || (location?.section === "center" && align !== "end")
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
          resize: false,
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, 2],
        },
      },
    ],
  });

  const handleClick = useCallback(
    (b: Button | MenuItem) => () => {
      const t =
        "buttonType" in b ? b.buttonType?.value : "menuType" in b ? b.menuType?.value : undefined;
      if (t === "menu") {
        setVisibleMenuButton(!visibleMenuButton);
        return;
      } else if (t === "camera") {
        const camera =
          "buttonCamera" in b
            ? b.buttonCamera?.value
            : "menuCamera" in b
            ? b.menuCamera?.value
            : undefined;
        if (camera) {
          onFlyTo?.(camera, { duration: 2 });
        }
      } else {
        let link =
          "buttonLink" in b ? b.buttonLink?.value : "menuLink" in b ? b.menuLink?.value : undefined;
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
    [onFlyTo, visibleMenuButton],
  );

  return (
    <Wrapper publishedTheme={theme} button={b}>
      <Button
        publishedTheme={theme}
        button={b}
        onClick={b && handleClick(b)}
        ref={referenceElement}>
        {(b?.buttonStyle?.value === "icon" || b?.buttonStyle?.value === "texticon") &&
          b?.buttonIcon && <Icon icon={b?.buttonIcon?.value} size={20} />}
        {b?.buttonStyle?.value !== "icon" && (
          <Text
            size="footnote"
            customColor
            otherProperties={{
              marginLeft: b?.buttonIcon && b?.buttonStyle?.value === "texticon" ? "5px" : undefined,
            }}>
            {b?.buttonTitle?.value}
          </Text>
        )}
      </Button>
      <MenuWrapper ref={popperElement} style={{ ...styles.popper }} {...attributes.popper}>
        {visibleMenuButton && (
          <MenuInnerWrapper publishedTheme={theme} button={b}>
            {menuItems?.map(i => (
              <MenuItem
                align="center"
                publishedTheme={theme}
                key={i.id}
                item={i}
                button={b}
                onClick={handleClick(i)}>
                <Flex align="center">
                  {i.menuIcon && <Icon icon={i.menuIcon?.value} size={20} />}
                  <Text
                    size="footnote"
                    customColor
                    otherProperties={{
                      marginLeft: i.menuIcon?.value ? "5px" : undefined,
                    }}>
                    {i.menuTitle?.value}
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
  border-radius: ${metricsSizes["xs"]}px;
  &,
  > div {
    background-color: ${({ button, publishedTheme }) =>
      button?.buttonBgcolor?.value || publishedTheme};
  }
`;

const Button = styled.div<{ button?: Button; publishedTheme?: Theme }>`
  display: flex;
  border-radius: ${metricsSizes["xs"]}px;
  min-width: 35px;
  height: 35px;
  padding: 0 10px;
  line-height: 35px;
  box-sizing: border-box;
  color: ${({ button, publishedTheme }) => button?.buttonColor?.value || publishedTheme?.mainText};
  cursor: pointer;
  align-items: center;
  user-select: none;

  &:hover {
    background: ${({ publishedTheme, button }) =>
      mask(button?.buttonBgcolor?.value) || publishedTheme?.mask};
  }
`;

const MenuWrapper = styled.div`
  z-index: ${({ theme }) => theme.zIndexes.dropDown};
  border-radius: 3px;
  max-height: 30vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const MenuInnerWrapper = styled.div<{ button?: Button; publishedTheme?: Theme }>`
  min-width: 35px;
  width: 100%;
  color: ${({ button, publishedTheme }) => button?.buttonColor?.value || publishedTheme?.mainText};
  white-space: nowrap;
`;

const MenuItem = styled(Flex)<{
  item?: MenuItem;
  button?: Button;
  publishedTheme?: Theme;
}>`
  min-height: ${({ item }) => (item?.menuType?.value === "border" ? null : "25px")};
  border-radius: ${({ item }) => (item?.menuType?.value === "border" ? null : "3px")};
  padding: ${({ item }) => (item?.menuType?.value === "border" ? "0 10px" : "2px 10px")};
  cursor: ${({ item }) => (item?.menuType?.value === "border" ? null : "pointer")};
  background: ${({ publishedTheme, item, button }) =>
    item?.menuType?.value === "border"
      ? mask(button?.buttonBgcolor?.value) || publishedTheme?.mask
      : null};
  border-bottom: ${({ item, publishedTheme, button }) =>
    item?.menuType?.value === "border"
      ? `1px solid ${button?.buttonColor?.value || publishedTheme?.weakText}`
      : null};
  user-select: none;

  &:hover {
    background: ${({ publishedTheme, item, button }) =>
      item?.menuType?.value === "border"
        ? null
        : mask(button?.buttonBgcolor?.value) || publishedTheme?.mask};
  }
`;
