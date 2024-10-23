import { useHasActiveGQLTasks } from "@reearth/services/state";
import { keyframes, styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

const offsetX = 16;
const offsetY = 16;

const CursorStatus: FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });

  const [enabled] = useHasActiveGQLTasks();

  const handleMouseMove = useCallback((event: MouseEvent) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    enabled && (
      <Wrapper left={mousePosition.x + offsetX} top={mousePosition.y + offsetY}>
        <Loader />
      </Wrapper>
    )
  );
};

export default CursorStatus;

const Wrapper = styled("div")<{ left: number; top: number }>(
  ({ left, top, theme }) => ({
    position: "absolute",
    left: `${left}px`,
    top: `${top}px`,
    pointerEvents: "none",
    zIndex: theme.zIndexes.editor.loading
  })
);

const loaderKeyframes = keyframes`
  100%{transform: rotate(1turn)}
`;

const Loader = styled("div")(() => ({
  width: 30,
  aspectRatio: 1,
  borderRadius: "50%",
  background:
    "radial-gradient(farthest-side,#666 94%,#0000) top/6px 6px no-repeat, conic-gradient(#0000 30%,#666)",
  ["-webkit-mask"]:
    "radial-gradient(farthest-side,#0000 calc(100% - 6px),#000 0)",
  animation: `${loaderKeyframes} 1s infinite linear`
}));
