import { FC, ReactNode } from "react";

import { Button } from "@reearth/beta/lib/reearth-ui";
import { fonts, styled } from "@reearth/services/theme";

export type ModalPanelProps = {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  layout?: "common";
  onCancel?: () => void;
};

export const ModalPanel: FC<ModalPanelProps> = ({ title, children, actions, layout, onCancel }) => {
  return (
    <Wrapper>
      <HeaderWrapper>
        <Title>{title}</Title>
        <Button iconButton icon="close" size="small" onClick={onCancel} appearance="simple" />
      </HeaderWrapper>
      {layout === "common" ? (
        <CommonLayout>{children}</CommonLayout>
      ) : (
        <Content>{children}</Content>
      )}

      {actions && <ActionWrapper>{actions}</ActionWrapper>}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  background: theme.bg.transparentBlack,
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
}));

const ActionWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  background: theme.bg[1],
  borderBottomRightRadius: theme.radius.large,
  borderBottomLeftRadius: theme.radius.large,
  justifyContent: "flex-end",
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing.normal,
}));

const CommonLayout = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  background: theme.bg[1],
}));
