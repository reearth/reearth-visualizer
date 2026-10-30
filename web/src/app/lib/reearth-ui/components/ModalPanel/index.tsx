import { Button, Icon, IconName } from "@reearth/app/lib/reearth-ui";
import { fonts, styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

export type ModalPanelProps = {
  icon?: IconName;
  title?: string;
  /** Replaces the icon and title in the header bar, e.g. with tabs. */
  header?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  layout?: "common";
  onCancel?: () => void;
  appearance?: "simple" | "normal";
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  dataTestid?: string;
  withBackground?: boolean;
};

export const ModalPanel: FC<ModalPanelProps> = ({
  title,
  icon,
  header,
  children,
  actions,
  layout,
  onCancel,
  appearance = "normal",
  ariaLabelledby,
  ariaDescribedby,
  dataTestid,
  withBackground
}) => {
  return (
    <Wrapper
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      data-testid={dataTestid}
    >
      {appearance !== "simple" && (
        <HeaderWrapper withBackground={withBackground}>
          {header ?? (
            <>
              {icon && <Icon icon={icon} size="normal" />}
              <Title>{title}</Title>
            </>
          )}
          <Button
            iconButton
            icon="close"
            size="small"
            onClick={onCancel}
            appearance="simple"
            ariaLabel="close"
          />
        </HeaderWrapper>
      )}
      {layout === "common" ? (
        <CommonLayout>{children}</CommonLayout>
      ) : (
        <Content>{children}</Content>
      )}
      {actions && (
        <ActionWrapper
          withBackground={withBackground}
          showBorder={appearance !== "simple"}
        >
          {actions}
        </ActionWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  background: theme.bg[1],
  borderRadius: theme.radius.large
}));

const HeaderWrapper = styled("div")<{ withBackground?: boolean }>(
  ({ theme, withBackground }) => ({
    display: css.display.flex,
    justifyContent: css.justifyContent.spaceBetween,
    alignItems: css.alignItems.center,
    gap: theme.spacing.small,
    alignSelf: "stretch",
    padding: `${theme.spacing.normal}px`,
    color: theme.content.main,
    background: withBackground ? theme.bg[2] : theme.bg[1],
    borderBottom: `1px solid ${theme.outline.weaker}`,
    borderTopRightRadius: theme.radius.large,
    borderTopLeftRadius: theme.radius.large
  })
);

const Title = styled("div")(() => ({
  flex: "1 0 0",
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`
}));

const Content = styled("div")(() => ({
  alignSelf: "stretch"
}));

const ActionWrapper = styled("div")<{
  showBorder: boolean;
  withBackground?: boolean;
}>(({ theme, showBorder, withBackground }) => ({
  padding: theme.spacing.large,
  background: withBackground ? theme.bg[2] : theme.bg[1],
  borderBottomRightRadius: theme.radius.large,
  borderBottomLeftRadius: theme.radius.large,
  justifyContent: css.justifyContent.flexEnd,
  display: css.display.flex,
  alignItems: css.alignItems.flexStart,
  borderTop: showBorder ? `1px solid ${theme.outline.weaker}` : "none",
  gap: theme.spacing.normal
}));

const CommonLayout = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  background: theme.bg[1]
}));
