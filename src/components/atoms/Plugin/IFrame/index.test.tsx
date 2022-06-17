import { render, screen } from "@testing-library/react";

import Component from ".";

test("works", async () => {
  // Empty html prop
  const { rerender } = render(<Component />);
  expect(screen.queryByTestId("iframe")).not.toBeInTheDocument();

  // Set html prop
  const [promise, resolve] = deferred();
  rerender(<Component html="<h1>Hoge</h1>" onLoad={resolve} />);
  expect(screen.getByTestId("iframe")).toBeInTheDocument();
  expect((screen.getByTestId("iframe") as HTMLIFrameElement).contentDocument?.body.innerHTML).toBe(
    "",
  );
  await promise;
  expect((screen.getByTestId("iframe") as HTMLIFrameElement).contentDocument?.body.innerHTML).toBe(
    "<h1>Hoge</h1>",
  );

  // Update html prop
  const [promise2, resolve2] = deferred();
  rerender(<Component html="<h1>Foo</h1>" onLoad={resolve2} />);
  expect(screen.getByTestId("iframe")).toBeInTheDocument();
  expect((screen.getByTestId("iframe") as HTMLIFrameElement).contentDocument?.body.innerHTML).toBe(
    "",
  );
  await promise2;
  expect((screen.getByTestId("iframe") as HTMLIFrameElement).contentDocument?.body.innerHTML).toBe(
    "<h1>Foo</h1>",
  );
});

// This unit test will be failed because JSDOM does not support script evaluation in iframes.
// Check out this component via Storybook instead.
//
// test("host -> iframe -> host", async () => {
//   const ref = createRef<Ref>();
//   const html = `<script>window.addEventListener("message", e => parent.postMessage(e.data, "*"));</script>`;
//   const [promise, resolve] = deferred();
//   const [promise2, resolve2] = deferred();
//   const onMessage = jest.fn<void, [any]>(() => resolve2());
//   render(<Component ref={ref} html={html} onLoad={resolve} onMessage={onMessage} />);

//   await promise;

//   expect(onMessage).toBeCalledTimes(0);
//   ref.current.postMessage({ foo: "bar" });

//   await promise2;

//   expect(onMessage).toBeCalledTimes(1);
//   expect(onMessage).toBeCalledWith({ foo: "bar" });
// });

const deferred = (): [Promise<void>, () => void, () => void] => {
  let resolve: () => void = () => {};
  let reject: () => void = () => {};
  return [
    new Promise<void>((r, rj) => {
      resolve = r;
      reject = rj;
    }),
    resolve,
    reject,
  ];
};
