import { FC, ReactNode } from "react";

import { Button } from "@reearth/beta/lib/reearth-ui";
import { fonts, styled } from "@reearth/services/theme";

export type ModalPanelProps = {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  onCancel?: () => void;
  isHeader?: boolean;
  darkGrayBgColor?: boolean;
  showBorder?: boolean;
};

export const ModalPanel: FC<ModalPanelProps> = ({
  title,
  children,
  actions,
  onCancel,
  isHeader = true,
  darkGrayBgColor = false,
  showBorder = true,
}) => {
  return (
    <Wrapper darkGrayBgColor={darkGrayBgColor}>
      {isHeader && (
        <HeaderWrapper>
          <Title>{title}</Title>
          <Button iconButton icon="close" size="small" onClick={onCancel} appearance="simple" />
        </HeaderWrapper>
      )}
      <Content>{children}</Content>
      {actions && <ActionWrapper showBorder={showBorder}>{actions}</ActionWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ darkGrayBgColor: boolean }>(({ theme, darkGrayBgColor }) => ({
  display: "flex",
  flexDirection: "column",
  background: darkGrayBgColor ? theme.bg[1] : theme.bg.transparentBlack,
  borderRadius: theme.radius.large,
}));

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  alignSelf: "stretch",
  padding: `${theme.spacing.normal}px`,
  color: theme.content.main,
  background: theme.bg[1],
  borderBottom: `1px solid ${theme.outline.weaker}`,
  borderTopRightRadius: theme.radius.large,
  borderTopLeftRadius: theme.radius.large,
}));

const Title = styled("div")(() => ({
  flex: "1 0 0",
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
}));

const Content = styled("div")(() => ({
  alignSelf: "stretch",
  userSelect: "none",
}));

const ActionWrapper = styled("div")<{ showBorder: boolean }>(({ theme, showBorder }) => ({
  padding: theme.spacing.normal,
  background: theme.bg[1],
  borderBottomRightRadius: theme.radius.large,
  borderBottomLeftRadius: theme.radius.large,
  justifyContent: "flex-end",
  display: "flex",
  alignItems: "flex-start",
  borderTop: showBorder ? `1px solid ${theme.outline.weaker}` : "none",
  gap: theme.spacing.normal,
}));

export default ModalPanel;
