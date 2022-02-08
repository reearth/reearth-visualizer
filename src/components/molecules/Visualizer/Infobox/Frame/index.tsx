import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClickAway, useMedia } from "react-use";

import Flex from "@reearth/components/atoms/Flex";
import FloatedPanel from "@reearth/components/atoms/FloatedPanel";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, css, usePublishTheme } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import { metricsSizes } from "@reearth/theme/metrics";
import { Typography, typographyStyles } from "@reearth/util/value";

import { SceneProperty } from "../../Engine";

export type InfoboxStyles = {
  typography?: Typography;
  bgcolor?: string;
  infoboxPaddingTop?: number;
  infoboxPaddingBottom?: number;
  infoboxPaddingLeft?: number;
  infoboxPaddingRight?: number;
};

export type Props = {
  className?: string;
  infoboxKey?: string;
  sceneProperty?: SceneProperty;
  title?: string;
  size?: "small" | "large";
  visible?: boolean;
  noContent?: boolean;
  styles?: InfoboxStyles;
  onClick?: () => void;
  onClickAway?: () => void;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
};

const InfoBox: React.FC<Props> = ({
  className,
  infoboxKey,
  sceneProperty,
  title,
  size,
  visible,
  noContent,
  styles,
  children,
  onClick,
  onClickAway,
  onEnter,
  onEntered,
  onExit,
  onExited,
}) => {
  const publishedTheme = usePublishTheme(sceneProperty?.theme);
  const isSmallWindow = useMedia("(max-width: 624px)");
  const ref = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  useClickAway(ref, () => onClickAway?.());

  const handleOpen = useCallback(() => {
    if (open || (noContent && isSmallWindow)) return;
    setOpen(true);
  }, [open, noContent, isSmallWindow]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!ref2.current) return;
    ref2.current.scrollLeft = 0;
    ref2.current.scrollTop = 0;
  }, [infoboxKey]);

  useEffect(() => {
    if (!visible) {
      setOpen(true);
    }
  }, [visible]);

  const wrapperStyles = useMemo(
    () => css`
      background-color: ${styles?.bgcolor || publishedTheme?.background};
      ${typographyStyles({ color: publishedTheme?.mainText, ...styles?.typography })}
    `,
    [publishedTheme, styles?.bgcolor, styles?.typography],
  );
  return (
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
      size={size}
      floated>
      <Wrapper ref={ref} open={open}>
        <TitleFlex flex="0 0 auto" direction="column" onClick={handleOpen}>
          {!open && (
            <IconWrapper align="center" justify="space-around">
              <StyledIcon color={publishedTheme.mainIcon} icon="arrowLeft" size={16} open={open} />
              <StyledIcon color={publishedTheme.mainIcon} icon="infobox" size={24} open={open} />
            </IconWrapper>
          )}
          {!open ? null : (
            <Text size="m" weight="bold" customColor>
              <TitleText>{title || " "}</TitleText>
            </Text>
          )}
        </TitleFlex>
        <CloseBtn
          color={publishedTheme.mainIcon}
          icon="cancel"
          size={16}
          onClick={handleClose}
          open={open}
        />
        <Content
          ref={ref2}
          open={open}
          paddingTop={styles?.infoboxPaddingTop}
          paddingBottom={styles?.infoboxPaddingBottom}
          paddingLeft={styles?.infoboxPaddingLeft}
          paddingRight={styles?.infoboxPaddingRight}>
          {children}
        </Content>
      </Wrapper>
    </StyledFloatedPanel>
  );
};

const StyledFloatedPanel = styled(FloatedPanel)<{
  floated?: boolean;
  open?: boolean;
  size?: "small" | "large";
}>`
  top: 15%;
  right: ${({ open }) => (open ? "30px" : "-6px")};
  max-height: 70%;
  width: ${({ size, open }) => (open ? (size == "large" ? "624px" : "346px") : "80px")};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: ${({ theme }) => theme.zIndexes.propertyFieldPopup};
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

const TitleFlex = styled(Flex)<{ open?: boolean }>`
  margin: ${({ open }) => (!open ? metricsSizes["s"] : metricsSizes["m"]) + "px auto"};
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  width: 75%;
`;

const StyledIcon = styled(Icon)<{ open?: boolean; color: string }>`
  display: ${({ open }) => (open ? "none" : "block")};
  color: ${({ color }) => color};
`;

const TitleText = styled.span`
  line-height: ${metricsSizes["2xl"]}px;
`;

const CloseBtn = styled(Icon)<{ open?: boolean; color: string }>`
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
  padding-top: ${({ paddingTop }) => (paddingTop ? `${paddingTop}px` : null)};
  padding-bottom: ${({ paddingBottom }) => (paddingBottom ? `${paddingBottom}px` : null)};
  padding-left: ${({ paddingLeft }) => (paddingLeft ? `${paddingLeft}px` : null)};
  padding-right: ${({ paddingRight }) => (paddingRight ? `${paddingRight}px` : null)};
`;

export default InfoBox;
