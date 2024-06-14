import { FC, ReactNode, useCallback, useMemo } from "react";

import { Collapse } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

export type PanelProps = {
  title?: string;
  extend?: boolean;
  collapsed?: boolean;
  storageId?: string;
  alwaysOpen?: boolean;
  children?: ReactNode;
};

export const Panel: FC<PanelProps> = ({
  title,
  extend,
  storageId,
  collapsed,
  alwaysOpen,
  children,
}) => {
  const theme = useTheme();

  const storageKey = storageId ? `reearth-visualizer-${storageId}-collapsed` : undefined;

  const initialCollapsed = useMemo(
    () => !!(storageKey ? localStorage.getItem(storageKey) === "1" : collapsed),
    [storageKey, collapsed],
  );

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
          background="transparent"
          headerBg={theme.bg[2]}
          size="small"
          collapsed={initialCollapsed}
          disabled={alwaysOpen}
          onCollapse={handleCollapse}>
          {children}
        </Collapse>
      ) : (
        children
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ extend?: boolean }>(({ theme, extend }) => ({
  flex: extend ? 1 : "0 0 auto",
  borderRadius: theme.radius.small,
}));
