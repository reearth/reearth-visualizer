import { useHasActiveGQLTasks } from "@reearth/services/state";
import { keyframes, styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

const offsetX = 16;
const offsetY = 16;

const CursorStatus: FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [inView, setInView] = useState(true);
  const [enabled] = useHasActiveGQLTasks();

  const handleMouseMove = useCallback((event: MouseEvent) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setInView(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setInView(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return (
    enabled &&
    inView && (
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

const loaderColor = "#ccc";

const Loader = styled("div")(() => ({
  width: 24,
  aspectRatio: 1,
  borderRadius: "50%",
  background: `radial-gradient(farthest-side,${loaderColor} 100%,#0000) top/6px 6px no-repeat, conic-gradient(#0000 30%,${loaderColor})`,
  WebkitMask: "radial-gradient(farthest-side,#0000 calc(100% - 6px),#000 0)",
  animation: `${loaderKeyframes} 1s infinite linear`
}));
