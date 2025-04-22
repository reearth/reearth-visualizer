import { Collapse, IconButton } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, MouseEvent, ReactNode, useCallback, useMemo } from "react";

import { AreaRef } from "../Area";

export type PanelProps = {
  title?: string;
  extend?: boolean;
  collapsed?: boolean;
  storageId?: string;
  noPadding?: boolean;
  alwaysOpen?: boolean;
  background?: "default" | "normal" | string;
  areaRef?: React.RefObject<AreaRef>;
  showCollapseArea?: boolean;
  dataTestid?: string;
  children?: ReactNode;
};

export const Panel: FC<PanelProps> = ({
  title,
  extend,
  storageId,
  collapsed,
  noPadding,
  alwaysOpen,
  background = "default",
  areaRef,
  showCollapseArea,
  dataTestid,
  children
}) => {
  const theme = useTheme();

  const storageKey = storageId
    ? `reearth-visualizer-${storageId}-collapsed`
    : undefined;

  const initialCollapsed = useMemo(
    () => !!(storageKey ? localStorage.getItem(storageKey) === "1" : collapsed),
    [storageKey, collapsed]
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
    [storageKey]
  );

  const collapseArea = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      areaRef?.current?.collapse();
    },
    [areaRef]
  );

  const actions = useMemo(() => {
    if (!showCollapseArea) {
      return undefined;
    }
    return (
      <IconButton
        icon="arrowsHorizontalIn"
        size="small"
        appearance="simple"
        onClick={collapseArea}
      />
    );
  }, [showCollapseArea, collapseArea]);

  return (
    <Wrapper extend={extend}>
      {title ? (
        <Collapse
          title={title}
          background={backgroundStyle}
          headerBg={theme.bg[2]}
          size="small"
          collapsed={alwaysOpen ? false : initialCollapsed}
          noPadding={noPadding}
          disabled={alwaysOpen}
          actions={actions}
          onCollapse={handleCollapse}
        >
          {children}
        </Collapse>
      ) : (
        <ContentWrapper
          background={backgroundStyle}
          extend={extend}
          data-testId={dataTestid}
        >
          {children}
        </ContentWrapper>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")<{ extend?: boolean }>(({ theme, extend }) => ({
  display: "flex",
  flexDirection: "column",
  flex: extend ? 1 : "0 0 auto",
  borderRadius: theme.radius.small,
  minHeight: 0
}));

const ContentWrapper = styled("div")<{ background?: string; extend?: boolean }>(
  ({ background, extend, theme }) => ({
    display: "flex",
    flex: extend ? 1 : "0 0 auto",
    background: background,
    borderRadius: theme.radius.small
  })
);
