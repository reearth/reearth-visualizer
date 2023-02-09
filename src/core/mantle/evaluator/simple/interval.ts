import { Data, Feature, TimeInterval } from "../../types";

export function evalTimeInterval(
  features: Feature[] | undefined,
  time: Data["time"],
): TimeInterval[] | void {
  if (!features || !time?.property) {
    return;
  }
  const startTimes: Date[] = [];
  for (const feature of features) {
    const property = feature.properties[time.property];
    if (!property) {
      continue;
    }
    startTimes.push(new Date(property));
  }
  startTimes.sort((a, b) => a.getTime() - b.getTime());
  return startTimes.map((start, i) => [
    start,
    time.interval ? new Date(start.getTime() + time.interval) : startTimes[i + 1],
  ]);
}
