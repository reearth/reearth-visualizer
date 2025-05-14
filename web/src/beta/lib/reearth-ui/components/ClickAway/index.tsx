import { FC, ReactNode, useEffect, useRef } from "react";

type ClickAwayProps = {
  children: ReactNode;
  onClickAway?: () => void;
  dataTestid?: string;
};

export const ClickAway: FC<ClickAwayProps> = ({
  children,
  onClickAway,
  dataTestid
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onClickAway) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClickAway?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside, {
      passive: true
    });
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClickAway]);

  return (
    <div ref={containerRef} data-testid={dataTestid}>
      {children}
    </div>
  );
};
