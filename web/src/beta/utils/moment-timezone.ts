import moment from "moment-timezone";

type TimezoneInfo = {
  timezone: string;
  offset: string;
};

export const getUniqueTimezones = (timezones: string[]): TimezoneInfo[] => {
  const uniqueTimezones: TimezoneInfo[] = [];
  const seenOffsets = new Set<string>();
  timezones.forEach(timezone => {
    const offset = moment.tz(timezone).utcOffset() / 60;

    if (Number.isInteger(offset)) {
      const offsetString = offset >= 0 ? `+${offset}` : `${offset}`;
      const offsetTimezone = `${offsetString}:00`;

      if (!seenOffsets.has(offsetTimezone)) {
        uniqueTimezones.push({ timezone, offset: offsetTimezone });
        seenOffsets.add(offsetTimezone);
      }
    }
  });

  uniqueTimezones.sort((a, b) => {
    const offsetA = parseInt(a.offset);
    const offsetB = parseInt(b.offset);
    return offsetA - offsetB;
  });

  return uniqueTimezones;
};
