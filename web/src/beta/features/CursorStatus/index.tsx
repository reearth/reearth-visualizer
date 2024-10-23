import { useHasActiveGQLTasks } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useEffect, useState } from "react";
import { BounceLoader } from "react-spinners";

const offsetX = 10;
const offsetY = 10;

const CursorStatus: FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const theme = useTheme();

  const [enabled] = useHasActiveGQLTasks();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY
      });
    };

    return document.addEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    enabled && (
      <Wrapper left={mousePosition.x + offsetX} top={mousePosition.y + offsetY}>
        <BounceLoader color={theme.publish.main} size={16} />
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
