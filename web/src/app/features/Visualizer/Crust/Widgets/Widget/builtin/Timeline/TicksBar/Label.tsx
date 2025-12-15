import { FC, useMemo } from "react";

import { formatDate } from "./utils";

type LabelProps = {
  time: number;
  left: number;
  timezone: string;
  level?: number;
};

const Label: FC<LabelProps> = ({ time, left, timezone, level }) => {
  const [dateString, timeString] = formatDate(
    time,
    timezone,
    !!(level && level >= 7)
  );

  const styles = useMemo(
    () => ({
      left: `${left}%`,
      transform:
        left === 0
          ? "translateX(10%)"
          : left === 100
            ? "translateX(-110%)"
            : "translateX(-50%)",
      textAlign:
        left === 0
          ? ("start" as const)
          : left === 100
            ? ("end" as const)
            : ("center" as const)
    }),
    [left]
  );

  return (
    <div className="absolute leading-3 top-px" style={styles}>
      <div className="whitespace-nowrap">{timeString}</div>
      <div className="whitespace-nowrap">{dateString}</div>
    </div>
  );
};

export default Label;
