let latestLogoutAt: number | null = null;

export const getLatestLogoutAt = (): number | null => latestLogoutAt;

export const updateLatestLogoutAt = (unixTimestamp: number): void => {
  if (latestLogoutAt === null || unixTimestamp > latestLogoutAt) {
    latestLogoutAt = unixTimestamp;
  }
};
