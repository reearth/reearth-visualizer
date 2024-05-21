import { FC, ReactNode } from "react";

import { Button } from "@reearth/beta/lib/reearth-ui/components/Button";
import { fonts, styled } from "@reearth/services/theme";

export type PopupPanelProps = {
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  onApply?: () => void;
};

export const PopupPanel: FC<PopupPanelProps> = ({ title, children, onClose, onApply }) => {
  return (
    <Wrapper>
      <Header>
        <Title>{title}</Title>
        {/* TODD: Use Icon Component based on icon */}
        <CloseIcon onClick={onClose}>Icon</CloseIcon>
      </Header>
      {children}
      <Footer>
        <StyledButton size="small" title="Cancel" onClick={onClose} />
        <StyledButton size="small" title="Apply" appearance="primary" onClick={onApply} />
      </Footer>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  width: "286px",
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  boxShadow: theme.shadow.popup,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  color: theme.content.main,
}));

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing.normal,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderBottom: `1px solid ${theme.outline.weak}`,
}));

const CloseIcon = styled("div")(() => ({
  cursor: "pointer",
}));

const Title = styled("div")(() => ({}));

const Footer = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: `${theme.spacing.small}px`,
  borderTop: `1px solid ${theme.outline.weak}`,
  gap: theme.spacing.small,
}));

const StyledButton = styled(Button)(() => ({
  minWidth: "135px",
  padding: 0,
  margin: 0,
}));
