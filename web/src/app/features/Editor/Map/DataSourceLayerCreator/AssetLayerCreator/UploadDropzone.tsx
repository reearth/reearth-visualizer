import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { DragEvent, FC, ReactNode, useCallback, useRef, useState } from "react";

type Props = {
  // Hides the drop zone when nothing is being dragged or uploaded.
  active: boolean;
  // Omitted when the tab can't be uploaded to, which disables dropping.
  onDrop?: (files: File[]) => void;
  // Shown inside the drop zone (the upload list), when active.
  content?: ReactNode;
  children: ReactNode;
};

const hasFiles = (e: DragEvent) => e.dataTransfer.types.includes("Files");

// Accepts files dragged anywhere over the asset area, and while dragging or
// uploading shows the drop zone over the asset browser. The browser stays
// mounted (only hidden) so its scroll container keeps the pagination listeners
// attached to it.
const UploadDropzone: FC<Props> = ({ active, onDrop, content, children }) => {
  const [dragging, setDragging] = useState(false);
  // dragenter/dragleave also fire for child elements; count to know when the
  // pointer really leaves.
  const depth = useRef(0);

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      if (!onDrop || !hasFiles(e)) return;
      e.preventDefault();
      depth.current++;
      setDragging(true);
    },
    [onDrop]
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      // Required for the browser to allow dropping.
      if (onDrop && hasFiles(e)) e.preventDefault();
    },
    [onDrop]
  );

  const handleDragLeave = useCallback(() => {
    if (!onDrop) return;
    depth.current = Math.max(0, depth.current - 1);
    if (!depth.current) setDragging(false);
  }, [onDrop]);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (!onDrop || !hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      onDrop(Array.from(e.dataTransfer.files));
    },
    [onDrop]
  );

  return (
    <Wrapper
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Browser concealed={dragging || active}>{children}</Browser>
      {(dragging || active) && (
        <Zone data-testid="asset-layer-creator-dropzone">
          {!dragging && content}
        </Zone>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  position: css.position.relative,
  display: css.display.flex,
  flexDirection: css.flexDirection.column
}));

// Hidden with visibility rather than unmounted or display: none, so it keeps
// its size (a zero-height browser would make useLoadMore fetch every page).
const Browser = styled("div", {
  shouldForwardProp: (prop) => prop !== "concealed"
})<{ concealed: boolean }>(({ concealed }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  visibility: concealed ? css.visibility.hidden : undefined
}));

// Covers the asset browser, so the modal keeps its size.
const Zone = styled("div")(({ theme }) => ({
  position: css.position.absolute,
  inset: 0,
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  overflowY: css.overflow.auto,
  border: `1px solid ${theme.select.main}`,
  borderRadius: theme.radius.small,
  background: theme.select.weaker,
  ...theme.scrollBar
}));

export default UploadDropzone;
