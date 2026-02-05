import { Icon, PopupMenu, PopupMenuItem } from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useEffect, useMemo } from "react";

import { getIconName } from "../../../Crust/StoryPanel/utils";
import { InstallableBlock } from "../../types";

type Props = {
  id?: string;
  installableBlocks?: InstallableBlock[];
  openBlocks: boolean;
  alwaysShow?: boolean;
  showAreaHeight?: number;
  parentWidth?: number;
  onBlockOpen: () => void;
  onBlockAdd?: (extensionId?: string, pluginId?: string) => void;
};

const BlockAddBar: FC<Props> = ({
  id,
  installableBlocks,
  openBlocks,
  alwaysShow,
  showAreaHeight,
  parentWidth,
  onBlockOpen,
  onBlockAdd
}) => {
  const items: PopupMenuItem[] = useMemo(
    () =>
      installableBlocks?.map?.((b) => {
        return {
          id: `${b.extensionId}-${b.pluginId}`,
          title: b.name,
          icon: getIconName(b.extensionId),
          onClick: () => {
            onBlockAdd?.(b.extensionId, b.pluginId);
            onBlockOpen();
          }
        };
      }) ?? [],
    [installableBlocks, onBlockAdd, onBlockOpen]
  );

  const persist = useMemo(
    () => alwaysShow || openBlocks,
    [alwaysShow, openBlocks]
  );

  useEffect(() => {
    if (!id) return;
    const persistUI = alwaysShow || openBlocks;
    const listener = showWhenCloseToElement(id, persistUI, parentWidth);
    document.addEventListener("mousemove", listener);
    return () => {
      document.removeEventListener("mousemove", listener);
    };
  }, [id, alwaysShow, parentWidth, openBlocks]);

  return (
    <Wrapper>
      <Bar
        id={id}
        height={showAreaHeight}
        persist={persist}
        onClick={(e) => e.stopPropagation()}
        onMouseOver={(e) => e.stopPropagation()}
      >
        <PopupMenu
          placement="bottom-start"
          openMenu={openBlocks}
          onOpenChange={onBlockOpen}
          label={<StyledIcon icon="plus" size="normal" />}
          size="normal"
          width={200}
          menu={items}
        />
        <Line />
      </Bar>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  position: "relative",
  padding: `${theme.spacing.micro}px 0`,
  zIndex: theme.zIndexes.visualizer.storyBlockAddBar
}));

const Bar = styled("div")<{ height?: number; persist?: boolean }>(
  ({ height, persist, theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.small + 2,
    height: height ? `${height}px` : "1px",
    cursor: "pointer",
    "&:hover > *": {
      opacity: "100%"
    },
    "& > *": {
      opacity: persist ? "100%" : "0%",
      transition: "opacity 0.4s"
    }
  })
);

const StyledIcon = styled(Icon)<{ persist?: boolean }>(({ theme }) => ({
  color: theme.content.main,
  background: theme.select.main,
  padding: theme.spacing.micro,
  borderRadius: theme.radius.small
}));

const Line = styled("div")<{ persist?: boolean }>(({ theme }) => ({
  height: "1px",
  width: "100%",
  background: theme.select.main
}));

export default BlockAddBar;

const showWhenCloseToElement =
  (id?: string, persist?: boolean, parentWidth?: number) =>
  (event: MouseEvent) => {
    if (!id) return;

    const targetElement = document.getElementById(id) as HTMLElement;
    if (!targetElement) return;
    // Get the cursor position
    const cursorX = event.clientX;
    const cursorY = event.clientY;

    // Get the position and dimensions of the target element
    const targetRect = targetElement.getBoundingClientRect();
    const targetX = targetRect.x;
    const targetY = targetRect.y;
    const targetWidth = targetRect.width;
    const targetHeight = targetRect.height;

    // Calculate the distance between the cursor and the center of the target element
    const distanceX = Math.abs(cursorX - (targetX + targetWidth / 2));
    const distanceY = Math.abs(cursorY - (targetY + targetHeight / 2));

    // These values are how far from the center (x or y axis) of the element the cursor can be
    const yProximityThreshold = 10;
    let xProximityThreshold = 10;
    if (parentWidth) {
      xProximityThreshold = parentWidth / 2;
    }

    // If the cursor is close enough to the target element, show it; otherwise, hide it
    if (distanceX < xProximityThreshold && distanceY < yProximityThreshold) {
      const children = targetElement.children;
      for (const child of children) {
        const element = child as HTMLElement;
        if (element.style.opacity === "100%") return;
        element.style.opacity = "100%";
      }
    } else {
      if (persist) return;
      const children = targetElement.children;
      for (const child of children) {
        const element = child as HTMLElement;
        if (element.style.opacity === "0%") return;
        element.style.opacity = "0%";
      }
    }
  };
