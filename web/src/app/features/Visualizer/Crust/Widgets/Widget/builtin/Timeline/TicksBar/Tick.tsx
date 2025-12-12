import { useMemo } from "react";

const Tick = ({ left, level }: { left: number; level: number }) => {
  const heightPercent = useMemo(() => {
    switch (level) {
      case 4:
        return 100;
      case 3:
        return 75;
      case 2:
        return 50;
      case 1:
      default:
        return 25;
    }
  }, [level]);

  // Get color based on level using CSS custom properties that work with theming
  const colorClass = useMemo(() => {
    if (level <= 1) {
      return "bg-accent/60";
    }
    return "bg-accent/100";
  }, [level]);

  // Calculate position styles
  const positionStyles = useMemo(
    () => ({
      left: `${left}%`,
      height: `${heightPercent}%`
    }),
    [left, heightPercent]
  );

  return (
    <div
      className={`absolute bottom-0 w-px ${colorClass}`}
      style={positionStyles}
    />
  );
};

export default Tick;
