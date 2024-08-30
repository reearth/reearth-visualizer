import { Button } from "@reearth/beta/lib/reearth-ui";
import { fonts, styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

const DEFAULT_PANEL_WIDTH = 286;

export type PopupPanelProps = {
  title?: string;
  width?: number;
  children: ReactNode;
  actions?: ReactNode;
  onCancel?: () => void;
};

export const PopupPanel: FC<PopupPanelProps> = ({
  title,
  width,
  children,
  actions,
  onCancel
}) => {
  return (
    <Wrapper width={width}>
      <HeaderWrapper>
        <Title>{title}</Title>
        <Button
          iconButton
          icon="close"
          size="small"
          onClick={onCancel}
          appearance="simple"
        />
      </HeaderWrapper>
      <Content>{children}</Content>
      {actions && <ActionWrapper>{actions}</ActionWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ width?: number }>(({ width, theme }) => ({
  width: `${width ?? DEFAULT_PANEL_WIDTH}px`,
  minWidth: "120px",
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  boxShadow: theme.shadow.popup
}));

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  alignSelf: "stretch",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderBottom: `1px solid ${theme.outline.weak}`,
  color: theme.content.main
}));

const Title = styled("div")(() => ({
  flex: "1 0 0",
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`
}));

const Content = styled("div")(({ theme }) => ({
  padding: theme.spacing.small,
  alignSelf: "stretch"
}));

const ActionWrapper = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.outline.weak}`,
  padding: theme.spacing.small
}));
