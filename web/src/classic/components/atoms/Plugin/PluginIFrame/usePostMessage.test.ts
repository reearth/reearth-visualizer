import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { usePostMessage } from "./usePostMessage";

test("usePostMessage", () => {
  type P = Parameters<typeof usePostMessage>[0];
  const nullIFrame: P = { current: null };
  const iFrame: P = {
    current: {
      postMessage: vi.fn(),
      resize: () => {},
    },
  };

  const { result, rerender } = renderHook(
    ({ iFrame, pending }: { iFrame: P; pending?: boolean }) => usePostMessage(iFrame, pending),
    {
      initialProps: { iFrame: nullIFrame },
    },
  );

  result.current({ hoge: true });
  expect(iFrame.current?.postMessage).toBeCalledTimes(0);

  rerender({ iFrame });
  expect(iFrame.current?.postMessage).toBeCalledTimes(1);
  expect(iFrame.current?.postMessage).toBeCalledWith({ hoge: true });

  result.current({ foo: true });
  expect(iFrame.current?.postMessage).toBeCalledTimes(2);
  expect(iFrame.current?.postMessage).toBeCalledWith({ foo: true });

  rerender({ iFrame, pending: true });
  result.current({ bar: true });
  expect(iFrame.current?.postMessage).toBeCalledTimes(2);

  rerender({ iFrame, pending: false });
  expect(iFrame.current?.postMessage).toBeCalledTimes(3);
  expect(iFrame.current?.postMessage).toBeCalledWith({ bar: true });
});
