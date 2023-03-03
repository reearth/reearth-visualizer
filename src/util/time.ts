export const convertTime = (time: string | undefined): Date | undefined => {
  if (!time) return;

  try {
    return new Date(time);
  } catch {
    return undefined;
  }
};
