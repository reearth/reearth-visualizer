import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClickAway, useMedia } from "react-use";

import Flex from "@reearth/beta/components/Flex";
import FloatedPanel from "@reearth/beta/components/FloatedPanel";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { metricsSizes } from "@reearth/beta/utils/metrics";
import fonts from "@reearth/services/fonts";
import { styled, css } from "@reearth/services/theme";

import type { Theme } from "../types";
import { type Typography, typographyStyles } from "../utils";

export type Props = {
  className?: string;
  children?: ReactNode;
  infoboxKey?: string;
  theme?: Theme;
  title?: string;
  height?: number;
  outlineColor?: string;
  outlineWidth?: number;
  heightType?: "auto" | "manual";
  size?: "small" | "medium" | "large";
  position?: "right" | "middle" | "left";
  visible?: boolean;
  unselectOnClose?: boolean;
  noContent?: boolean;
  useMask?: boolean;
  typography?: Typography;
  backgroundColor?: string;
  showTitle?: boolean;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  onMaskClick?: () => void;
  onClick?: () => void;
  onClickAway?: () => void;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  onClose?: () => void;
};

const Frame: React.FC<Props> = ({
  className,
  infoboxKey,
  theme: publishedTheme,
  title,
  size,
  height,
  heightType,
  position,
  outlineColor,
  outlineWidth,
  visible,
  unselectOnClose,
  noContent,
  useMask,
  typography,
  backgroundColor,
  showTitle,
  children,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  onMaskClick,
  onClick,
  onClickAway,
  onEnter,
  onEntered,
  onExit,
  onExited,
  onClose,
}) => {
  const isSmallWindow = useMedia("(max-width: 624px)");
  const ref = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [showMask, setShowMask] = useState<boolean | undefined>(false);
  useClickAway(ref, () => onClickAway?.());

  const handleOpen = useCallback(() => {
    if (open || (noContent && isSmallWindow)) return;
    setOpen(true);
  }, [open, noContent, isSmallWindow]);

  const handleClose = useCallback(() => {
    if (!unselectOnClose) {
      setOpen(false);
    }
    onClose?.();
  }, [onClose, unselectOnClose]);

  useEffect(() => {
    if (!ref2.current) return;
    ref2.current.scrollLeft = 0;
    ref2.current.scrollTop = 0;
  }, [infoboxKey]);

  useEffect(() => {
    if (!visible) {
      setOpen(true);
    }
    setTimeout(() => {
      setShowMask(visible);
    }, 0);
  }, [visible]);

  const wrapperStyles = useMemo(
    () => css`
      background-color: ${backgroundColor || publishedTheme?.background};
      ${typographyStyles({ color: publishedTheme?.mainText, ...typography })}
    `,
    [publishedTheme, backgroundColor, typography],
  );

  return (
    <>
      <Mask activate={showMask && useMask} onClick={onMaskClick} />
      <StyledFloatedPanel
        className={className}
        visible={visible}
        open={open}
        styles={wrapperStyles}
        onClick={onClick}
        onEnter={onEnter}
        onEntered={onEntered}
        onExit={onExit}
        onExited={onExited}
        position={position}
        size={size}
        height={height}
        heightType={heightType}
        outlineColor={outlineColor ? outlineColor : publishedTheme?.mainText}
        outlineWidth={outlineWidth}
        floated>
        <Wrapper ref={ref} open={open}>
          <TitleFlex flex="0 0 auto" direction="column" onClick={handleOpen}>
            {!open && (
              <IconWrapper align="center" justify="space-around">
                <StyledIcon
                  color={publishedTheme?.mainIcon}
                  icon="arrowLeft"
                  size={16}
                  open={open}
                />
                <StyledIcon color={publishedTheme?.mainIcon} icon="infobox" size={24} open={open} />
              </IconWrapper>
            )}
            {open && (
              <Text size="m" weight="bold" customColor>
                <TitleText show={showTitle ?? true}>{title || " "}</TitleText>
              </Text>
            )}
          </TitleFlex>
          <CloseBtn
            color={publishedTheme?.mainIcon}
            icon="cancel"
            size={16}
            onClick={handleClose}
            open={open}
          />
          <Content
            ref={ref2}
            open={open}
            paddingTop={paddingTop}
            paddingBottom={paddingBottom}
            paddingLeft={paddingLeft}
            paddingRight={paddingRight}>
            {children}
          </Content>
        </Wrapper>
      </StyledFloatedPanel>
    </>
  );
};

const Mask = styled.div<{ activate?: boolean }>`
  display: ${({ activate }) => (activate ? "block" : "none")};
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.6);
  overflow-x: hidden;
`;

const StyledFloatedPanel = styled(FloatedPanel) <{
  floated?: boolean;
  open?: boolean;
  position?: "right" | "middle" | "left";
  size?: "small" | "medium" | "large";
  height?: number;
  heightType?: "auto" | "manual";
  outlineColor?: string;
  outlineWidth?: number;
}>`
  top: 15%;
  ${({ open, position }) =>
    open
      ? position === "middle"
        ? `left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;`
        : position === "left"
          ? "left: 30px"
          : `right: 30px`
      : "right: -6px"};
  ${({ heightType, height, open }) =>
    heightType === "auto" ? "max-height: 70%" : height && open ? `height: ${height}px` : ""};
  width: ${({ size, open }) =>
    open ? (size === "large" ? "624px" : size === "medium" ? "540px" : "346px") : "80px"};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  ${({ outlineWidth, outlineColor, open }) =>
    outlineWidth && open ? `border: ${outlineWidth}px ${outlineColor} solid` : ""};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: ${({ theme }) => theme.classic.zIndexes.propertyFieldPopup};
  transition: all 0.6s;

  @media (max-width: 624px) {
    right: ${({ open }) => (open ? "16px" : "-8px")};
    top: 20vh;
    bottom: auto;
    width: ${({ open }) => (open ? "calc(100% - 33px)" : "70px")};
    ${({ open }) => !open && "height: 40px;"}
    max-height: 60vh;
  }
`;

const Wrapper = styled.div<{ open?: boolean }>`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: ${({ open }) => (open ? "280px" : "100%")};

  @media (max-width: 624px) {
    transition: all 0.4s;
    width: auto;
  }
`;

const IconWrapper = styled(Flex)`
  width: 52px;
  @media (max-width: 624px) {
    width: 42px;
  }
`;

const TitleFlex = styled(Flex) <{ open?: boolean }>`
  margin: ${({ open }) => (!open ? metricsSizes["s"] : metricsSizes["m"]) + "px auto"};
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  width: 75%;
`;

const StyledIcon = styled(Icon) <{ open?: boolean; color?: string }>`
  display: ${({ open }) => (open ? "none" : "block")};
  color: ${({ color }) => color};
`;

const TitleText = styled.span<{
  show: boolean;
}>`
  line-height: ${metricsSizes["2xl"]}px;
  display: ${({ show }) => (show ? "block" : "none")};
`;

const CloseBtn = styled(Icon) <{ open?: boolean; color?: string }>`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: ${({ color }) => color};
  display: ${({ open }) => (open ? "block" : "none")};
`;

const Content = styled.div<{
  open?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}>`
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  flex: auto;
  font-size: ${fonts.sizes.s}px;
  padding: 10px 0 20px 0;
  transition: all 0.2s linear;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  a {
    color: inherit;
  }

  max-height: ${({ open }) => (open ? "50vh" : "0")};
  padding: ${({ open }) => (open ? "20px 0" : "0")};
  padding-top: ${({ paddingTop, open }) => (paddingTop && open ? `${paddingTop}px` : null)};
  padding-bottom: ${({ paddingBottom, open }) =>
    paddingBottom && open ? `${paddingBottom}px` : null};
  padding-left: ${({ paddingLeft, open }) => (paddingLeft && open ? `${paddingLeft}px` : null)};
  padding-right: ${({ paddingRight, open }) => (paddingRight && open ? `${paddingRight}px` : null)};
`;

export default Frame;
