import { ValueTypes, ValueType } from "@reearth/beta/utils/value";
import type { Item } from "@reearth/services/api/propertyApi/utils";

import type { Spacing } from "../mantle";

export const getFieldValue = (items: Item[], fieldId: string, fieldGroup?: string) => {
  const d = items.find(i => i.schemaGroup === (fieldGroup ?? "default")) ?? items[0];
  const isList = d && "items" in d;
  const schemaField = d?.schemaFields.find(sf => sf.id === fieldId);
  return !isList
    ? d?.fields.find(f => f.id === schemaField?.id)?.value
    : d.items.map(item => ({
        id: item.id,
        ...item.fields.reduce((obj: { [id: string]: ValueTypes[ValueType] | undefined }, field) => {
          obj[field.id] = field.value;
          return obj;
        }, {}),
      }));
};

export const calculatePaddingValue = (
  defaultValue: Spacing,
  value?: Spacing,
  editorMode?: boolean,
) => {
  const calculateValue = (position: keyof Spacing, v?: number): { [key: string]: number } => {
    if (v === undefined) {
      return {
        [position]: editorMode ? defaultValue[position] : 0,
      };
    }
    return {
      [position]: v,
    };
  };

  return value
    ? Object.assign(
        {},
        ...Object.keys(value).map(p =>
          calculateValue(p as keyof Spacing, value[p as keyof Spacing]),
        ),
      )
    : defaultValue;
};

const MONTH_LABEL_LIST = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatTimezone = (time: number) => {
  const d = new Date(time);
  const timezoneOffset = d.getTimezoneOffset();
  const timezoneSign = timezoneOffset >= 0 ? "-" : "+";
  const timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const timezoneMinutes = Math.abs(timezoneOffset) % 60;
  const timezone = `${timezoneSign}${timezoneHours}:${timezoneMinutes.toString().padStart(2, "0")}`;
  return timezone;
};
export const formatDateForTimeline = (
  time: number,
  options: { detail?: boolean } = {},
  timezone?: string,
) => {
  const localTimezoneOffset = new Date().getTimezoneOffset();
  const d = new Date(
    time + (localTimezoneOffset + Number(timezone?.split(":")[0]) * 60) * 60 * 1000,
  );

  const year = d.getFullYear();
  const month = MONTH_LABEL_LIST[d.getMonth()];
  const date = `${d.getDate()}`.padStart(2, "0");
  const hour = `${d.getHours()}`.padStart(2, "0");
  if (!options.detail) {
    return `${year} ${month} ${date} ${hour}:00:00.00 ${timezone}`;
  }
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const seconds = `${d.getSeconds()}`.padStart(2, "0");

  return `${year} ${month} ${date} ${hour}:${minutes}:${seconds} ${timezone}`;
};

export const formatDateForSliderTimeline = (
  time: number,
  options: { detail?: boolean } = {},
  timezone?: string,
) => {
  const localTimezoneOffset = new Date().getTimezoneOffset();
  const d = new Date(
    time + (localTimezoneOffset + Number(timezone?.split(":")[0]) * 60) * 60 * 1000,
  );

  const month = MONTH_LABEL_LIST[d.getMonth()];
  const date = `${d.getDate()}`.padStart(2, "0");
  const hour = `${d.getHours()}`.padStart(2, "0");
  if (!options.detail) {
    return `${month} ${date} ${hour}`;
  }
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  return ` ${month} ${date} ${hour}:${minutes}`;
};

export const formatDateToSting = (d: number) => {
  const date = new Date(d);
  return date.toISOString();
};

const timeStringToSeconds = (timeString: string) => {
  const parts = timeString.split("/");
  const valueUnit = parts[0].trim();
  const value = parseFloat(valueUnit);
  const unit = valueUnit.substr(value.toString().length).trim().toLowerCase();

  switch (unit) {
    case "sec":
    case "secs":
      return value;
    case "min":
    case "mins":
      return value * 60;
    case "hr":
    case "hrs":
      return value * 3600;
    default:
      return NaN;
  }
};

export const convertOptionToSeconds = (data: string[]) => {
  const objectsArray = [];

  for (const timeString of data) {
    const seconds = timeStringToSeconds(timeString);
    if (!isNaN(seconds)) {
      objectsArray.push({ timeString, seconds });
    }
  }

  return objectsArray;
};

export const formatRangeDateAndTime = (data: string) => {
  const lastIdx = data.lastIndexOf(" ");
  const date = data.slice(0, lastIdx);
  const time = data.slice(lastIdx + 1);
  return {
    date,
    time,
  };
};

export const convertPositionToTime = (e: MouseEvent, start: number, end: number) => {
  const curTar = e.currentTarget as HTMLElement;
  const width = curTar.scrollWidth - 32;
  const rect = curTar.getBoundingClientRect();
  const scrollX = curTar.scrollLeft;
  const clientX = e.clientX - rect.x;
  const posX = clientX + scrollX;
  const percent = posX / width;
  const rangeDiff = end - start;
  const sec = rangeDiff * percent;
  return Math.min(Math.max(start, start + sec), end);
};

export const getTimeZone = (time: string) => {
  const zone = time.match(/([-+]\d{1,2}:\d{2})$/);
  const timezoneOffset = zone?.[1];
  return timezoneOffset || "";
};

export const formatISO8601 = (time: string) => {
  // For backforad compatibility
  // from: 2021-08-31T00:00:00 +9:00
  // from: 2021-08-31T00:00:00+9:00
  // to: 2021-08-31T00:00:00+09:00
  const timezone = getTimeZone(time);
  const splitZone = timezone.split(":");
  if (splitZone[0].length === 2) {
    return time
      .replace(timezone, `${splitZone[0][0]}0${splitZone[0][1]}:${splitZone[1]}`)
      .replace(" ", "");
  }
  return time.replace(" ", "");
};
