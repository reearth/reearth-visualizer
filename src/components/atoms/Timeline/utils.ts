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

export const formatDateForTimeline = (time: number, options: { detail?: boolean } = {}) => {
  const d = new Date(time);
  const year = d.getFullYear();
  const month = MONTH_LABEL_LIST[d.getMonth()];
  const date = `${d.getDate()}`.padStart(2, "0");
  const hour = `${d.getHours()}`.padStart(2, "0");
  if (!options.detail) {
    return `${month} ${date} ${year} ${hour}:00:00.00`;
  }
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const seconds = `${d.getSeconds()}`.padStart(2, "0");
  return `${month} ${date} ${year} ${hour}:${minutes}:${seconds}.00`;
};
