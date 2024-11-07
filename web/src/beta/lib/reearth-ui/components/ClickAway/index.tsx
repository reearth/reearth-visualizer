import { FC, ReactNode, useEffect, useRef } from "react";

type ClickAwayProps = {
  children: ReactNode;
  onClickAway?: () => void;
};

export const ClickAway: FC<ClickAwayProps> = ({ children, onClickAway }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onClickAway) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClickAway?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickAway]);

  return <div ref={containerRef}>{children}</div>;
};
