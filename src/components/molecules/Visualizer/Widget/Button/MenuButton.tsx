import { useRef, useCallback, useState } from "react";
import { usePopper } from "react-popper";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, usePublishTheme, PublishTheme, metricsSizes, mask } from "@reearth/theme";
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
  button?: Button;
  menuItems?: MenuItem[];
  location?: {
    section?: "left" | "right" | "center";
    area?: "top" | "middle" | "bottom";
  };
  align?: "end" | "start" | "centered";
  sceneProperty?: SceneProperty;
};

export default function MenuButton({
  button: b,
  menuItems,
  location: position,
  align,
  sceneProperty,
}: Props): JSX.Element {
  const ctx = useContext();
  const publishedTheme = usePublishTheme(sceneProperty?.theme);
  const [visibleMenuButton, setVisibleMenuButton] = useState(false);
  const flyTo = ctx?.reearth.visualizer.camera.flyTo;

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
      const t = "buttonType" in b ? b.buttonType : "menuType" in b ? b.menuType : undefined;
      if (t === "menu") {
        setVisibleMenuButton(!visibleMenuButton);
        return;
      } else if (t === "camera") {
        const camera =
          "buttonCamera" in b ? b.buttonCamera : "menuCamera" in b ? b.menuCamera : undefined;
        if (camera) {
          flyTo?.(camera, { duration: 2 });
        }
      } else {
        let link = "buttonLink" in b ? b.buttonLink : "menuLink" in b ? b.menuLink : undefined;
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
    [flyTo, visibleMenuButton],
  );

  return (
    <Wrapper publishedTheme={publishedTheme} button={b}>
      <Button
        publishedTheme={publishedTheme}
        button={b}
        onClick={b && handleClick(b)}
        ref={referenceElement}>
        {(b?.buttonStyle === "icon" || b?.buttonStyle === "texticon") && b?.buttonIcon && (
          <Icon icon={b?.buttonIcon} size={20} />
        )}
        {b?.buttonStyle !== "icon" && (
          <Text
            size="xs"
            customColor
            otherProperties={{
              marginLeft: b?.buttonIcon && b?.buttonStyle === "texticon" ? "5px" : undefined,
            }}>
            {b?.buttonTitle}
          </Text>
        )}
      </Button>
      <MenuWrapper ref={popperElement} style={{ ...styles.popper }} {...attributes.popper}>
        {visibleMenuButton && (
          <MenuInnerWrapper publishedTheme={publishedTheme} button={b}>
            {menuItems?.map(i => (
              <MenuItem
                align="center"
                publishedTheme={publishedTheme}
                key={i.id}
                item={i}
                button={b}
                onClick={handleClick(i)}>
                <Flex align="center">
                  {i.menuIcon && <Icon icon={i.menuIcon} size={20} />}
                  <Text
                    size="xs"
                    customColor
                    otherProperties={{
                      marginLeft: i.menuIcon ? "5px" : undefined,
                    }}>
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

const Wrapper = styled.div<{ button?: Button; publishedTheme: PublishTheme }>`
  border-radius: ${metricsSizes["xs"]}px;
  &,
  > div {
    background-color: ${({ button, publishedTheme }) => button?.buttonBgcolor || publishedTheme};
  }
`;

const Button = styled.div<{ button?: Button; publishedTheme: PublishTheme }>`
  display: flex;
  border-radius: ${metricsSizes["xs"]}px;
  min-width: 35px;
  height: 35px;
  padding: 0 10px;
  line-height: 35px;
  box-sizing: border-box;
  color: ${({ button, publishedTheme }) => button?.buttonColor || publishedTheme.mainText};
  cursor: pointer;
  align-items: center;
  user-select: none;

  &:hover {
    background: ${({ publishedTheme, button }) =>
      mask(button?.buttonBgcolor) || publishedTheme.mask};
  }
`;

const MenuWrapper = styled.div`
  z-index: ${({ theme }) => theme.zIndexes.dropDown};
  border-radius: 3px;
  max-height: 30vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const MenuInnerWrapper = styled.div<{ button?: Button; publishedTheme: PublishTheme }>`
  min-width: 35px;
  width: 100%;
  color: ${({ button, publishedTheme }) => button?.buttonColor || publishedTheme.mainText};
  white-space: nowrap;
`;

const MenuItem = styled(Flex)<{ item?: MenuItem; button?: Button; publishedTheme: PublishTheme }>`
  min-height: ${({ item }) => (item?.menuType === "border" ? null : "25px")};
  border-radius: ${({ item }) => (item?.menuType === "border" ? null : "3px")};
  padding: ${({ item }) => (item?.menuType === "border" ? "0 10px" : "2px 10px")};
  cursor: ${({ item }) => (item?.menuType === "border" ? null : "pointer")};
  background: ${({ publishedTheme, item, button }) =>
    item?.menuType === "border" ? mask(button?.buttonBgcolor) || publishedTheme.mask : null};
  border-bottom: ${({ item, publishedTheme, button }) =>
    item?.menuType === "border"
      ? `1px solid ${button?.buttonColor || publishedTheme.weakText}`
      : null};
  user-select: none;

  &:hover {
    background: ${({ publishedTheme, item, button }) =>
      item?.menuType === "border" ? null : mask(button?.buttonBgcolor) || publishedTheme.mask};
  }
`;
