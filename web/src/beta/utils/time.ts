export const convertTime = (
  time: string | Date | undefined
): Date | undefined => {
  if (!time) return;
  if (time instanceof Date) {
    return !isNaN(time.getTime()) ? time : undefined;
  }
  try {
    const dateTime = new Date(time);
    return !isNaN(dateTime.getTime()) ? dateTime : undefined;
  } catch {
    return undefined;
  }
};

export const truncMinutes = (d: Date) => {
  d.setMinutes(0);
  d.setSeconds(0, 0);
  return d;
};

export const formatRelativeTime = (date: Date, lang = "en"): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const units: Record<
    string,
    { value: number; label: string; jaLabel: string }
  > = {
    year: { value: 31536000, label: "year", jaLabel: "年" },
    month: { value: 2592000, label: "month", jaLabel: "ヶ月" },
    day: { value: 86400, label: "day", jaLabel: "日" },
    hour: { value: 3600, label: "hour", jaLabel: "時間" },
    minute: { value: 60, label: "minute", jaLabel: "分" },
    second: { value: 1, label: "second", jaLabel: "秒" }
  };

  for (const unitKey in units) {
    const { value, label, jaLabel } = units[unitKey];
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      const unitLabel =
        lang === "ja"
          ? jaLabel
          : label + (interval > 1 && lang !== "ja" ? "s" : "");
      return `${interval} ${unitLabel}${lang === "ja" ? " 前" : " ago"}`;
    }
  }

  return "just now";
};
