import React, { useRef, useCallback, useState } from "react";
import { usePopper } from "react-popper";

import Icon from "@reearth/components/atoms/Icon";
import { fonts, styled, useTheme, usePublishTheme, PublishTheme } from "@reearth/theme";
import { Camera } from "@reearth/util/value";

import { SceneProperty } from "../../Engine";
import { useContext } from "../../Plugin";

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
  location?: {
    section?: "left" | "right" | "center";
    area?: "top" | "middle" | "bottom";
  };
  align?: "end" | "start" | "centered";
  sceneProperty?: SceneProperty;
};

export default function ({
  button: b,
  menuItems,
  location: position,
  align,
  sceneProperty,
}: Props): JSX.Element {
  const ctx = useContext();
  const publishedTheme = usePublishTheme(sceneProperty?.theme);
  const theme = useTheme();
  const [visibleMenuButton, setVisibleMenuButton] = useState<string>();
  const flyTo = ctx?.reearth.visualizer.flyTo;

  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(referenceElement.current, popperElement.current, {
    placement:
      position?.area === "bottom"
        ? position?.section === "left" || (position?.section === "center" && align !== "end")
          ? "top-start"
          : "top-end"
        : position?.area === "middle"
        ? position?.section === "left"
          ? align === "end"
            ? "top-start"
            : "bottom-start"
          : align === "end"
          ? "top-end"
          : "bottom-end"
        : position?.section === "right" || align === "end"
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

  return (
    <Wrapper>
      <Button
        publishedTheme={publishedTheme}
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
          zIndex: theme.zIndexes.dropDown,
          ...styles.popper,
        }}
        {...attributes.popper}>
        {visibleMenuButton && (
          <MenuWrapper background={publishedTheme.background}>
            {menuItems?.map(i => (
              <MenuItem
                color={publishedTheme.mainText}
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
  margin-left: 5px;

  &:first-of-type {
    margin-left: 0;
  }
`;

const StyledIcon = styled(Icon)<{ margin: boolean }>`
  vertical-align: middle;
  margin-right: ${({ margin }) => (margin ? "5px" : null)};
`;

const MenuWrapper = styled.div<{ background: string }>`
  width: 100%;
  background-color: ${({ background }) => background};
  border-radius: 3px;
  overflow-wrap: break-word;
  hyphens: auto;
`;

const MenuItem = styled.a<{ item?: MenuItem; color: string }>`
  display: block;
  font-size: ${fonts.sizes.xs}px;
  margin: ${({ item }) => (item?.menuType === "border" ? "0 5px" : null)};
  padding: ${({ item }) => (item?.menuType === "border" ? null : "5px 20px")};
  cursor: ${({ item }) => (item?.menuType === "border" ? null : "pointer")};
  border-top: ${({ item }) => (item?.menuType === "border" ? "1px solid #fff" : null)};
  opacity: ${({ item }) => (item?.menuType === "border" ? "0.5" : null)};
  color: ${({ color }) => color};
`;

const Button = styled.div<{ button?: Button; publishedTheme: PublishTheme }>`
  display: flex;
  border-radius: 3px;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  font-size: ${fonts.sizes["2xs"]}px;
  line-height: 32px;
  box-sizing: border-box;
  background-color: ${({ button, publishedTheme }) =>
    button?.buttonBgcolor || publishedTheme.background};
  color: ${({ button, publishedTheme }) => button?.buttonColor || publishedTheme.mainText};
  cursor: pointer;
  align-items: center;
  user-select: none;
`;
