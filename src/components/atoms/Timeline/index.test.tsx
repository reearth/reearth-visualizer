import { useState } from "react";
import { expect, test, vi, vitest } from "vitest";

import { render, screen, fireEvent } from "@reearth/test/utils";

import {
  PADDING_HORIZONTAL,
  BORDER_WIDTH,
  KNOB_SIZE,
  NORMAL_SCALE_WIDTH,
  GAP_HORIZONTAL,
} from "./constants";

import Timeline from ".";

const CURRENT_TIME = new Date("2022-07-03T00:00:00.000").getTime();
// This is width when range is one day.
const SCROLL_WIDTH = 2208;

const TimelineWrapper: React.FC<{
  isOpened?: boolean;
  onPlay?: () => void;
  onPlayReversed?: () => void;
  onSpeedChange?: (speed: number) => void;
}> = ({ isOpened = true, onPlay, onPlayReversed, onSpeedChange }) => {
  const [currentTime, setCurrentTime] = useState(CURRENT_TIME);
  return (
    <Timeline
      currentTime={currentTime}
      range={{ start: CURRENT_TIME }}
      onClick={setCurrentTime}
      onDrag={setCurrentTime}
      onPlay={onPlay}
      onPlayReversed={onPlayReversed}
      onSpeedChange={onSpeedChange}
      isOpened={isOpened}
    />
  );
};

test("it should open when timeline open button is clicked", () => {
  const { rerender } = render(<TimelineWrapper isOpened={false} />);

  expect(screen.queryAllByRole("slider")).toHaveLength(0);

  rerender(<TimelineWrapper isOpened />);

  expect(screen.queryAllByRole("slider")).not.toHaveLength(0);
});

test("it should get time from clicked position", () => {
  render(<TimelineWrapper />);
  const slider = screen.getAllByRole("slider")[1];
  const currentPosition = 12;
  vi.spyOn(slider, "scrollWidth", "get").mockImplementation(() => SCROLL_WIDTH);

  fireEvent.click(slider, {
    clientX: PADDING_HORIZONTAL + BORDER_WIDTH + currentPosition,
  });

  const iconWrapper = screen.getByTestId("knob-icon");
  const actualLeft = Math.trunc(parseInt(iconWrapper.style.left.split("px")[0]));
  expect(actualLeft).toBe(
    Math.trunc(currentPosition + PADDING_HORIZONTAL - KNOB_SIZE / 2 + NORMAL_SCALE_WIDTH),
  );
});

test("it should get time from mouse moved position", () => {
  render(<TimelineWrapper />);
  const slider = screen.getAllByRole("slider")[1];
  const currentPosition = 12;
  const clientX = PADDING_HORIZONTAL + BORDER_WIDTH + currentPosition;
  const expectedLeft = Math.trunc(
    currentPosition + PADDING_HORIZONTAL - KNOB_SIZE / 2 + NORMAL_SCALE_WIDTH,
  );

  const scroll = vi.fn();
  window.HTMLElement.prototype.scroll = scroll;

  vi.spyOn(slider, "scrollWidth", "get").mockImplementation(() => SCROLL_WIDTH);

  // Check initial position
  expect(Math.trunc(parseInt(screen.getByTestId("knob-icon").style.left.split("px")[0], 10))).toBe(
    expectedLeft - currentPosition,
  );

  // It should not move
  fireEvent.mouseMove(slider, {
    clientX,
  });
  expect(Math.trunc(parseInt(screen.getByTestId("knob-icon").style.left.split("px")[0], 10))).toBe(
    expectedLeft - currentPosition,
  );

  // It should move
  fireEvent.mouseDown(slider);
  fireEvent.mouseMove(slider, {
    clientX,
  });
  fireEvent.mouseUp(slider);
  expect(Math.trunc(parseInt(screen.getByTestId("knob-icon").style.left.split("px")[0], 10))).toBe(
    expectedLeft,
  );

  // It should not move
  fireEvent.mouseMove(slider, {
    clientX: clientX * 2,
  });
  expect(Math.trunc(parseInt(screen.getByTestId("knob-icon").style.left.split("px")[0], 10))).toBe(
    expectedLeft,
  );
});

test("it should get correct strongScaleHours from amount of scroll", () => {
  render(<TimelineWrapper />);
  const slider = screen.getAllByRole("slider")[1];
  vi.spyOn(slider, "scrollWidth", "get").mockImplementation(() => SCROLL_WIDTH);

  fireEvent.wheel(slider, {
    deltaY: -50,
  });
  expect(
    parseInt(slider.querySelector("div")?.style.gap.split(" ")[1].split("px")[0] || "", 10),
  ).toBe(GAP_HORIZONTAL * 1.5);

  // Reset gap and increase memory.
  fireEvent.wheel(slider, {
    deltaY: -50,
  });
  expect(
    parseInt(slider.querySelector("div")?.style.gap.split(" ")[1].split("px")[0] || "", 10),
  ).toBe(GAP_HORIZONTAL);
});

test("it should invoke onPlay or onPlayReversed when play button is clicked", async () => {
  const mockOnPlay = vitest.fn();
  const mockOnPlayReversed = vitest.fn();
  render(<TimelineWrapper onPlay={mockOnPlay} onPlayReversed={mockOnPlayReversed} />);

  // TODO: get element by label text
  // Click play button
  fireEvent.click(screen.getAllByRole("button")[2]);
  expect(mockOnPlay).toBeCalledWith(true);
  // Click play button again
  fireEvent.click(screen.getAllByRole("button")[2]);
  expect(mockOnPlay).toBeCalledWith(false);

  // TODO: get element by label text
  // Click playback button
  fireEvent.click(screen.getAllByRole("button")[1]);
  expect(mockOnPlayReversed).toBeCalledWith(true);
  // Click playback button again
  fireEvent.click(screen.getAllByRole("button")[1]);
  expect(mockOnPlayReversed).toBeCalledWith(false);

  // Click play button
  fireEvent.click(screen.getAllByRole("button")[2]);
  expect(mockOnPlay).toBeCalledWith(true);
  // And click playback button
  fireEvent.click(screen.getAllByRole("button")[1]);
  expect(mockOnPlayReversed).toBeCalledWith(true);
  expect(mockOnPlay).toBeCalledWith(false);
  // Finally click play button
  fireEvent.click(screen.getAllByRole("button")[2]);
  expect(mockOnPlay).toBeCalledWith(true);
  expect(mockOnPlayReversed).toBeCalledWith(false);
});

test("it should invoke onSpeedChange when speed range is changed", async () => {
  const mockOnSpeedChange = vitest.fn();
  render(<TimelineWrapper onSpeedChange={mockOnSpeedChange} />);

  // TODO: get element by label text
  // Click play button
  fireEvent.input(screen.getAllByRole("slider")[0], { target: { value: 100 } });

  expect(mockOnSpeedChange).toBeCalledWith(100);
});
