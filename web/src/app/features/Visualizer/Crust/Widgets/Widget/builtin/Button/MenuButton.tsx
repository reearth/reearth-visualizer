import { Icon, IconName, Typography } from "@reearth/app/lib/reearth-ui";
import { Button } from "@reearth/app/lib/reearth-widget-ui/components/ui/button";
import { cn } from "@reearth/app/lib/reearth-widget-ui/utils";
import { mask } from "@reearth/services/theme";
import { useRef, useCallback, useState, useMemo } from "react";
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

  // Create CSS variables for custom theme
  const customStyles = useMemo(() => {
    if (!b?.buttonColor && !b?.buttonBgcolor && !theme) return undefined;

    return {
      "--widget-button-color": b?.buttonColor || theme?.mainText || "#373737",
      "--widget-button-bg": b?.buttonBgcolor || theme?.background || "#ECECEC",
      "--widget-button-hover":
        theme?.mask || mask(b?.buttonBgcolor) || "rgba(0,0,0,0.15)"
    } as React.CSSProperties;
  }, [b?.buttonColor, b?.buttonBgcolor, theme]);

  return (
    <div
      className="flex items-center gap-0.5 rounded-[4px]"
      style={
        customStyles
          ? {
              ...customStyles,
              backgroundColor:
                b?.buttonBgcolor || theme?.background || undefined
            }
          : undefined
      }
    >
      <Button
        variant="ghost"
        size="widget"
        customTheme={!!customStyles}
        className={cn(
          "rounded-[4px] select-none leading-[35px]",
          b?.buttonStyle === "icon" && "p-0"
        )}
        style={customStyles}
        onClick={b && handleClick(b)}
        ref={referenceElement as unknown as React.RefObject<HTMLButtonElement>}
      >
        {/* Icon */}
        {(b?.buttonStyle === "icon" || b?.buttonStyle === "texticon") &&
          b?.buttonIcon && (
            <img src={b.buttonIcon} width={20} height={20} alt="" />
          )}

        {/* Text */}
        {b?.buttonStyle !== "icon" && (
          <Typography
            size="body"
            color={b?.buttonColor}
            otherProperties={{
              marginLeft:
                b?.buttonIcon && b?.buttonStyle === "texticon"
                  ? "6px"
                  : undefined
            }}
          >
            {b?.buttonTitle}
          </Typography>
        )}
      </Button>

      {/* Menu Popper */}
      <div
        ref={popperElement}
        className={cn(
          "z-[200] rounded-[3px] max-h-[30vh] overflow-auto",
          "[-webkit-overflow-scrolling:touch]"
        )}
        style={styles.popper}
        {...attributes.popper}
      >
        {visibleMenuButton && (
          <div
            className="min-w-[35px] w-full whitespace-nowrap"
            style={{
              ...customStyles,
              backgroundColor: b?.buttonBgcolor || theme?.background || undefined
            }}
          >
            {menuItems?.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-start select-none",
                  item.menuType === "border"
                    ? "px-2.5"
                    : "min-h-[25px] rounded-[3px] px-2.5 py-0.5 cursor-pointer hover:bg-[var(--widget-button-hover)]"
                )}
                style={
                  item.menuType === "border"
                    ? {
                        background:
                          mask(b?.buttonBgcolor) || theme?.mask || undefined,
                        borderBottom: `1px solid ${b?.buttonColor || theme?.weakText}`
                      }
                    : undefined
                }
                onClick={handleClick(item)}
              >
                {item.menuIcon && <Icon icon={item.menuIcon} size={20} />}
                <Typography
                  size="footnote"
                  color={b?.buttonColor}
                  otherProperties={{
                    marginLeft: item.menuIcon ? "6px" : undefined
                  }}
                >
                  {item.menuTitle}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
