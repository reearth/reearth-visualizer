export const convertTime = (time: string | Date | undefined): Date | undefined => {
  if (!time) return;
  if (time instanceof Date) return time;
  try {
    return new Date(time);
  } catch {
    return undefined;
  }
};

export const truncMinutes = (d: Date) => {
  d.setMinutes(0);
  d.setSeconds(0, 0);
  return d;
};
