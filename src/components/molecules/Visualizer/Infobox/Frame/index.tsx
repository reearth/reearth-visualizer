import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClickAway, useMedia } from "react-use";

import { styled, css, useTheme } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import { metricsSizes } from "@reearth/theme/metrics";
import { Typography, typographyStyles } from "@reearth/util/value";
import Flex from "@reearth/components/atoms/Flex";
import FloatedPanel from "@reearth/components/atoms/FloatedPanel";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";

export type InfoboxStyles = {
  typography?: Typography;
  bgcolor?: string;
};

export type Props = {
  className?: string;
  infoboxKey?: string;
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
  const theme = useTheme();
  const isSmallWindow = useMedia("(max-width: 624px)");
  const ref = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(!isSmallWindow);
  useClickAway(ref, () => onClickAway?.());

  const handleOpen = useCallback(() => {
    if (open || (noContent && isSmallWindow)) return;
    setOpen(true);
  }, [open, noContent, isSmallWindow]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (isSmallWindow) setOpen(false);
  }, [infoboxKey, isSmallWindow]);

  useEffect(() => {
    if (!ref2.current) return;
    ref2.current.scrollLeft = 0;
    ref2.current.scrollTop = 0;
  }, [infoboxKey]);

  const wrapperStyles = useMemo(
    () => css`
      background-color: ${styles?.bgcolor || theme.infoBox.bg};
      ${typographyStyles({ color: theme.infoBox.mainText, ...styles?.typography })}
    `,
    [theme.infoBox.mainText, theme.infoBox.bg, styles?.bgcolor, styles?.typography],
  );

  return (
    <StyledFloatedPanel
      className={className}
      visible={visible}
      styles={wrapperStyles}
      onClick={onClick}
      onEnter={onEnter}
      onEntered={onEntered}
      onExit={onExit}
      onExited={onExited}
      floated>
      <Wrapper ref={ref} size={size} open={open}>
        <TitleFlex
          flex="0 0 auto"
          justify={open ? "flex-start" : "space-evenly"}
          direction="column"
          onClick={handleOpen}>
          {isSmallWindow && !noContent && <StyledIcon icon="arrowUp" size={24} open={open} />}
          <Text size="m" weight="bold" customColor>
            <TitleText>{title || " "}</TitleText>
          </Text>
          {!isSmallWindow && <StyledIcon icon="arrowDown" size={24} open={open} />}
        </TitleFlex>
        <CloseBtn icon="cancel" size={16} onClick={handleClose} open={open} />
        <Content ref={ref2} open={open}>
          {children}
        </Content>
      </Wrapper>
    </StyledFloatedPanel>
  );
};

const StyledFloatedPanel = styled(FloatedPanel)<{
  floated?: boolean;
}>`
  position: ${props => (props.floated ? "absolute" : "static")};
  top: 50px;
  right: 10px;
  max-height: calc(100% - 85px);
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: ${props => props.theme.zIndexes.propertyFieldPopup};

  @media (max-width: 624px) {
    left: 16px;
    right: 16px;
    top: auto;
    bottom: 80px;
  }
`;

const Wrapper = styled.div<{ size?: "small" | "large"; open?: boolean }>`
  overflow: hidden;
  width: ${props => (props.size == "large" ? "624px" : "346px")};
  max-height: calc(100% - 85px);
  display: flex;
  flex-direction: column;
  min-height: ${({ open }) => (open ? "280px" : "100%")};

  @media (max-width: 624px) {
    width: auto;
  }
`;

const TitleFlex = styled(Flex)`
  margin: ${metricsSizes["m"]}px auto;
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  width: 75%;
`;

const StyledIcon = styled(Icon)<{ open?: boolean }>`
  display: ${({ open }) => (open ? "none" : "block")};
`;

const TitleText = styled.span`
  line-height: ${metricsSizes["2xl"]}px;
`;

const CloseBtn = styled(Icon)<{ open?: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: ${props => props.theme.main.text};
  display: ${({ open }) => (open ? "block" : "none")};
`;

const Content = styled.div<{ open?: boolean }>`
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  flex: auto;
  font-size: ${fonts.sizes.s}px;
  padding: 10px 0 20px 0;

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
`;

export default InfoBox;
