import { describe, expect, test, vi } from "vitest";

import { interval, intervalDuring, tweenInterval } from "./raf";

describe("interval", () => {
  test("regular", () => {
    vi.useFakeTimers();
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");

    let count = 0;
    const cb = vi.fn<[number], boolean>(() => ++count <= 3);
    interval(cb);

    expect(cb).toBeCalledTimes(0);
    expect(requestAnimationFrame).toBeCalledTimes(1);
    expect(cancelAnimationFrame).toBeCalledTimes(0);

    vi.advanceTimersByTime(100);

    expect(cb).toBeCalledTimes(4);
    expect(cb.mock.calls[0][0]).toBe(0);
    for (let i = 1; i < cb.mock.calls.length; i++) {
      expect(cb.mock.calls[i][0]).toBeGreaterThan(cb.mock.calls[i - 1][0]);
    }
    expect(requestAnimationFrame).toBeCalledTimes(4);
    expect(cancelAnimationFrame).toBeCalledTimes(0);
  });

  test("cancel", () => {
    vi.useFakeTimers();
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");

    const cb = vi.fn();
    const cancel = interval(cb);

    expect(cb).toBeCalledTimes(0);
    expect(requestAnimationFrame).toBeCalledTimes(1);
    expect(cancelAnimationFrame).toBeCalledTimes(0);

    cancel();

    expect(cancelAnimationFrame).toBeCalledTimes(1);
    const requestId = requestAnimationFrame.mock.results[0].value;
    expect(cancelAnimationFrame).toBeCalledWith(requestId);

    vi.advanceTimersByTime(50);

    expect(cb).toBeCalledTimes(0);
  });

  test("delay", () => {
    vi.useFakeTimers();
    const setTimeout = vi.spyOn(window, "setTimeout");
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");

    const cb = vi.fn();
    interval(cb, 500);

    expect(cb).toBeCalledTimes(0);
    expect(setTimeout).toBeCalledTimes(1);
    expect(requestAnimationFrame).toBeCalledTimes(0);
    expect(cancelAnimationFrame).toBeCalledTimes(0);

    vi.advanceTimersByTime(400);
    expect(cb).toBeCalledTimes(0);

    vi.advanceTimersByTime(200);
    expect(cb).toBeCalledTimes(1);
    expect(requestAnimationFrame).toBeCalledTimes(0);
  });
});

test("intervalDuring", () => {
  vi.useFakeTimers();
  const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
  const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
  const cb = vi.fn();
  intervalDuring(cb, 100);

  expect(cb).toBeCalledTimes(0);
  expect(requestAnimationFrame).toBeCalledTimes(1);
  expect(cancelAnimationFrame).toBeCalledTimes(0);

  vi.advanceTimersByTime(200);

  const times = cb.mock.calls.length;
  expect(requestAnimationFrame).toBeCalledTimes(times);
  expect(cancelAnimationFrame).toBeCalledTimes(0);

  expect(cb.mock.calls[0][0]).toBe(0);
  expect(cb.mock.calls[cb.mock.calls.length - 1][0]).toBe(1);
  for (let i = 1; i < cb.mock.calls.length; i++) {
    expect(cb.mock.calls[i][0]).toBeGreaterThan(cb.mock.calls[i - 1][0]);
  }

  vi.advanceTimersByTime(100);

  // cb will not be called after intervalDuring ends
  expect(cb).toBeCalledTimes(times);
});

test("tweenInterval", () => {
  vi.useFakeTimers();
  const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame");
  const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
  const cb = vi.fn();
  tweenInterval(cb, "cubic", 100);

  expect(cb).toBeCalledTimes(0);
  expect(requestAnimationFrame).toBeCalledTimes(1);
  expect(cancelAnimationFrame).toBeCalledTimes(0);

  vi.advanceTimersByTime(200);

  const times = cb.mock.calls.length;
  expect(requestAnimationFrame).toBeCalledTimes(times);
  expect(cancelAnimationFrame).toBeCalledTimes(0);

  expect(cb.mock.calls[0][0]).toBe(0);
  expect(cb.mock.calls[0][1]).toBe(0);
  expect(cb.mock.calls[cb.mock.calls.length - 1][0]).toBe(1);
  expect(cb.mock.calls[cb.mock.calls.length - 1][1]).toBe(1);
  for (let i = 1; i < cb.mock.calls.length; i++) {
    expect(cb.mock.calls[i][1]).toBeGreaterThan(cb.mock.calls[i - 1][1]);
  }

  vi.advanceTimersByTime(100);

  // cb will not be called after intervalDuring ends
  expect(cb).toBeCalledTimes(times);
});
