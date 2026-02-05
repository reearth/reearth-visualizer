import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { usePostMessage } from "./usePostMessage";

test("usePostMessage", () => {
  type P = Parameters<typeof usePostMessage>[0];
  const nullIFrame: P = { current: null };
  const iFrame: P = {
    current: {
      postMessage: vi.fn(),
      resize: () => {}
    }
  };

  type HookProps = { iFrame: P; pending?: boolean };
  const { result, rerender } = renderHook(
    ({ iFrame, pending }: HookProps) =>
      usePostMessage(iFrame, pending),
    {
      initialProps: { iFrame: nullIFrame, pending: false }
    }
  );

  result.current({ hoge: true });
  expect(iFrame.current?.postMessage).toBeCalledTimes(0);

  rerender({ iFrame, pending: false });
  expect(iFrame.current?.postMessage).toBeCalledTimes(1);
  expect(iFrame.current?.postMessage).toBeCalledWith({ hoge: true });

  result.current({ foo: true });
  expect(iFrame.current?.postMessage).toBeCalledTimes(2);
  expect(iFrame.current?.postMessage).toBeCalledWith({ foo: true });

  rerender({ iFrame, pending: true } as HookProps);
  result.current({ bar: true });
  expect(iFrame.current?.postMessage).toBeCalledTimes(2);

  rerender({ iFrame, pending: false } as HookProps);
  expect(iFrame.current?.postMessage).toBeCalledTimes(3);
  expect(iFrame.current?.postMessage).toBeCalledWith({ bar: true });
});
