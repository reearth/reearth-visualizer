import { Icon, IconName, Typography } from "@reearth/app/lib/reearth-ui";
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
  menuIcon?: IconName;
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
          <Typography
            size="body"
            color={b?.buttonColor}
            otherProperties={{
              marginLeft:
                b?.buttonIcon && b?.buttonStyle === "texticon"
                  ? "5px"
                  : undefined
            }}
          >
            {b?.buttonTitle}
          </Typography>
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
                publishedTheme={theme}
                key={i.id}
                item={i}
                button={b}
                onClick={handleClick(i)}
              >
                {i.menuIcon && <Icon icon={i.menuIcon} size={20} />}
                <Typography
                  size="footnote"
                  color={b?.buttonColor}
                  otherProperties={{
                    marginLeft: i.menuIcon ? "5px" : undefined
                  }}
                >
                  {i.menuTitle}
                </Typography>
              </MenuItem>
            ))}
          </MenuInnerWrapper>
        )}
      </MenuWrapper>
    </Wrapper>
  );
}
const Wrapper = styled("div")<{ button?: Button; publishedTheme?: Theme }>(
  ({ theme, button, publishedTheme }) => ({
    borderRadius: `${spacingSizes["smallest"]}px`,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.micro,
    "&, > div": {
      backgroundColor: button?.buttonBgcolor || publishedTheme?.background
    }
  })
);

const Button = styled("div")<{ button?: Button; publishedTheme?: Theme }>(
  ({ theme, button, publishedTheme }) => ({
    borderRadius: `${spacingSizes["smallest"]}px`,
    display: "flex",
    minWidth: 35,
    height: 35,
    padding: `0 ${theme.spacing.small + 2}px`,
    lineHeight: 35,
    boxSizing: "border-box",
    color: button ? button?.buttonColor : publishedTheme?.mainText,
    cursor: "pointer",
    alignItems: "center",
    userSelect: "none",
    ["&:hover"]: {
      background: publishedTheme
        ? publishedTheme?.mask
        : mask(button?.buttonBgcolor)
    }
  })
);

const MenuWrapper = styled("div")(({ theme }) => ({
  zIndex: theme.zIndexes.visualizer.widget,
  borderRadius: theme.radius.smallest + 1,
  maxHeight: "30vh",
  overflow: "auto",
  WebkitOverflowScrolling: "touch"
}));

const MenuInnerWrapper = styled("div")<{
  button?: Button;
  publishedTheme?: Theme;
}>(({ button, publishedTheme }) => ({
  minWidth: 35,
  width: "100%",
  color: button?.buttonColor || publishedTheme?.mainText,
  whiteSpace: "nowrap"
}));

const MenuItem = styled("div")<{
  item?: MenuItem;
  button?: Button;
  publishedTheme?: Theme;
}>(({ item, button, publishedTheme, theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  minHeight: item?.menuType === "border" ? undefined : "25px",
  borderRadius:
    item?.menuType === "border" ? undefined : theme.radius.small - 1,
  padding:
    item?.menuType === "border"
      ? `0 ${theme.spacing.small + 2}px`
      : `${theme.spacing.micro}px ${theme.spacing.small + 2}px`,
  cursor: item?.menuType === "border" ? undefined : "pointer",
  background:
    item?.menuType === "border"
      ? mask(button?.buttonBgcolor) || publishedTheme?.mask
      : undefined,
  borderBottom:
    item?.menuType === "border"
      ? `1px solid ${button?.buttonColor || publishedTheme?.weakText}`
      : undefined,
  userSelect: "none",

  "&:hover": {
    background:
      item?.menuType === "border"
        ? undefined
        : mask(button?.buttonBgcolor) || publishedTheme?.mask
  }
}));
