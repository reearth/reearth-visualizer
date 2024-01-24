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
