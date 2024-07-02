export const convertTime = (time: string | Date | undefined): Date | undefined => {
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

export const convertTimeToString = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = 0;

  const pluralize = (value: number, unit: string): string => {
    return value === 1 ? `${value} ${unit}` : `${value} ${unit}s`;
  };

  switch (true) {
    case (interval = seconds / 31536000) > 1:
      return pluralize(Math.floor(interval), "year") + " ago";
    case (interval = seconds / 2592000) > 1:
      return pluralize(Math.floor(interval), "month") + " ago";
    case (interval = seconds / 86400) > 1:
      return pluralize(Math.floor(interval), "day") + " ago";
    case (interval = seconds / 3600) > 1:
      return pluralize(Math.floor(interval), "hour") + " ago";
    case (interval = seconds / 60) > 1:
      return pluralize(Math.floor(interval), "minute") + " ago";
    default:
      return pluralize(Math.floor(seconds), "second") + " ago";
  }
};
