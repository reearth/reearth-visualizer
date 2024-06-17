import { FC, ReactNode, useCallback, useMemo } from "react";

import { Collapse } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

export type PanelProps = {
  title?: string;
  extend?: boolean;
  collapsed?: boolean;
  storageId?: string;
  alwaysOpen?: boolean;
  background?: "default" | "normal" | string;
  children?: ReactNode;
};

export const Panel: FC<PanelProps> = ({
  title,
  extend,
  storageId,
  collapsed,
  alwaysOpen,
  background = "default",
  children,
}) => {
  const theme = useTheme();

  const storageKey = storageId ? `reearth-visualizer-${storageId}-collapsed` : undefined;

  const initialCollapsed = useMemo(
    () => !!(storageKey ? localStorage.getItem(storageKey) === "1" : collapsed),
    [storageKey, collapsed],
  );

  const backgroundStyle = useMemo(() => {
    if (background === "default") {
      return theme.bg[0];
    }
    if (background === "normal") {
      return theme.bg[1];
    }
    return background;
  }, [background, theme.bg]);

  const handleCollapse = useCallback(
    (collapsed: boolean) => {
      if (storageKey) {
        localStorage.setItem(storageKey, collapsed ? "1" : "0");
      }
    },
    [storageKey],
  );

  return (
    <Wrapper extend={extend}>
      {title ? (
        <Collapse
          title={title}
          background={backgroundStyle}
          headerBg={theme.bg[2]}
          size="small"
          collapsed={alwaysOpen ? false : initialCollapsed}
          disabled={alwaysOpen}
          onCollapse={handleCollapse}>
          {children}
        </Collapse>
      ) : (
        <ContentWrapper background={backgroundStyle}>{children}</ContentWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ extend?: boolean }>(({ theme, extend }) => ({
  display: "flex",
  flexDirection: "column",
  flex: extend ? 1 : "0 0 auto",
  borderRadius: theme.radius.small,
}));

const ContentWrapper = styled("div")<{ background?: string; extend?: boolean }>(
  ({ background, extend, theme }) => ({
    display: "flex",
    flex: extend ? 1 : "0 0 auto",
    background: background,
    borderRadius: theme.radius.small,
  }),
);
