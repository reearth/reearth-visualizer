import { FC, ReactNode } from "react";

import { Button } from "@reearth/beta/lib/reearth-ui/components/Button";
import { fonts, styled } from "@reearth/services/theme";

import { Icon } from "../Icon";

export type PopupPanelProps = {
  title?: string;
  children: ReactNode;
  onCancel?: () => void;
  onApply?: () => void;
};

export const PopupPanel: FC<PopupPanelProps> = ({ title, children, onCancel, onApply }) => {
  return (
    <Wrapper>
      <HeaderWrapper>
        <Title>{title}</Title>
        <IconWrapper onClick={onCancel}>
          <Icon icon="close" size="small" />
        </IconWrapper>
      </HeaderWrapper>
      <Content>{children}</Content>
      <ActionWrapper>
        <Button minWidth={131} size="small" title="Cancel" onClick={onCancel} />
        <Button minWidth={131} size="small" title="Apply" appearance="primary" onClick={onApply} />
      </ActionWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  width: "286px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-start",
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  boxShadow: theme.shadow.popup,
}));

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  alignSelf: "stretch",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderBottom: `1px solid ${theme.outline.weak}`,
  color: theme.content.main,
}));

const IconWrapper = styled("div")(() => ({
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const Title = styled("div")(() => ({
  flex: "1 0 0",
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
}));

const Content = styled("div")(({ theme }) => ({
  padding: theme.spacing.small,
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.normal,
  alignSelf: "stretch",
}));

const ActionWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  alignSelf: "stretch",
  padding: theme.spacing.small,
  borderTop: `1px solid ${theme.outline.weak}`,
  gap: theme.spacing.small,
}));
