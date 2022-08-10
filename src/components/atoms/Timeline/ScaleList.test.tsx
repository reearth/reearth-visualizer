import { expect, test } from "vitest";

import { render, screen } from "@reearth/test/utils";

import { EPOCH_SEC, GAP_HORIZONTAL, HOURS_SECS, MAX_ZOOM_RATIO, SCALE_INTERVAL } from "./constants";
import ScaleList from "./ScaleList";

const START_DATE = new Date("2022-07-03T12:21:21.100");
const END_DATA = new Date("2022-07-04T12:21:21.100");
const DIFF = END_DATA.getTime() - START_DATE.getTime();

test("it should render memory and date label", () => {
  // Convert epoch time to scale by every interval
  const scaleCount = Math.trunc(DIFF / EPOCH_SEC / SCALE_INTERVAL);
  const hoursCount = Math.trunc(HOURS_SECS / SCALE_INTERVAL);

  const { container } = render(
    <ScaleList
      start={START_DATE}
      scaleCount={scaleCount}
      hoursCount={hoursCount}
      scaleInterval={SCALE_INTERVAL}
      strongScaleHours={MAX_ZOOM_RATIO}
      gapHorizontal={GAP_HORIZONTAL}
    />,
  );

  // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
  const children = Array.from(container.querySelector("div")?.children || []);
  expect(children.length).toBe(scaleCount + 1);

  const expectedStrongScaleLabelList = [
    "Jul 03 2022 12:00:00.00",
    "Jul 03 2022 15:00:00.00",
    "Jul 03 2022 18:00:00.00",
    "Jul 03 2022 21:00:00.00",
    "Jul 04 2022 00:00:00.00",
    "Jul 04 2022 03:00:00.00",
    "Jul 04 2022 06:00:00.00",
    "Jul 04 2022 09:00:00.00",
  ];

  expectedStrongScaleLabelList.forEach(label => {
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

test("it should render memory and date label when scaleInterval is changed", () => {
  const scaleInterval = 60;

  // Convert epoch time to scale by every interval
  const scaleCount = Math.trunc(DIFF / EPOCH_SEC / scaleInterval);
  const hoursCount = Math.trunc(HOURS_SECS / scaleInterval);

  const { container } = render(
    <ScaleList
      start={START_DATE}
      scaleCount={scaleCount}
      hoursCount={hoursCount}
      scaleInterval={scaleInterval}
      strongScaleHours={MAX_ZOOM_RATIO}
      gapHorizontal={GAP_HORIZONTAL}
    />,
  );

  // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
  const children = Array.from(container.querySelector("div")?.children || []);
  expect(children.length).toBe(scaleCount + 1);

  const expectedStrongScaleLabelList = [
    "Jul 03 2022 12:00:00.00",
    "Jul 03 2022 15:00:00.00",
    "Jul 03 2022 18:00:00.00",
    "Jul 03 2022 21:00:00.00",
    "Jul 04 2022 00:00:00.00",
    "Jul 04 2022 03:00:00.00",
    "Jul 04 2022 06:00:00.00",
    "Jul 04 2022 09:00:00.00",
  ];

  expectedStrongScaleLabelList.forEach(label => {
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

test("it should render memory and date label when strongScaleHours is changed", () => {
  const scaleInterval = 60;
  const strongScaleHours = 1;

  // Convert epoch time to scale by every interval
  const scaleCount = Math.trunc(DIFF / EPOCH_SEC / scaleInterval);
  const hoursCount = Math.trunc(HOURS_SECS / scaleInterval);

  const { container } = render(
    <ScaleList
      start={START_DATE}
      scaleCount={scaleCount}
      hoursCount={hoursCount}
      scaleInterval={scaleInterval}
      strongScaleHours={strongScaleHours}
      gapHorizontal={GAP_HORIZONTAL}
    />,
  );

  // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
  const children = Array.from(container.querySelector("div")?.children || []);
  expect(children.length).toBe(scaleCount + 1);

  const expectedStrongScaleLabelList = [
    "Jul 03 2022 12:00:00.00",
    "Jul 03 2022 13:00:00.00",
    "Jul 03 2022 14:00:00.00",
    "Jul 03 2022 15:00:00.00",
    "Jul 03 2022 16:00:00.00",
    "Jul 03 2022 17:00:00.00",
    "Jul 03 2022 18:00:00.00",
    "Jul 03 2022 19:00:00.00",
    "Jul 03 2022 20:00:00.00",
    "Jul 03 2022 21:00:00.00",
    "Jul 03 2022 22:00:00.00",
    "Jul 03 2022 23:00:00.00",
    "Jul 04 2022 00:00:00.00",
    "Jul 04 2022 01:00:00.00",
    "Jul 04 2022 02:00:00.00",
    "Jul 04 2022 03:00:00.00",
    "Jul 04 2022 04:00:00.00",
    "Jul 04 2022 05:00:00.00",
    "Jul 04 2022 06:00:00.00",
    "Jul 04 2022 07:00:00.00",
    "Jul 04 2022 08:00:00.00",
    "Jul 04 2022 09:00:00.00",
  ];

  expectedStrongScaleLabelList.forEach(label => {
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
