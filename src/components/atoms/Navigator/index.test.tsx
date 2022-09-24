import { expect, test, vitest } from "vitest";

import { fireEvent, render, screen, waitFor } from "@reearth/test/utils";

import Navigator from ".";

test("it should rotate compass when degree props is changed", async () => {
  const { rerender } = render(<Navigator degree={0} />);

  const compass = screen.getByLabelText("compass");

  if (!compass.parentElement) {
    throw new Error("compass.parentElement should be exist");
  }

  expect(compass).toHaveStyle({ transform: "rotate(0deg)" });

  rerender(<Navigator degree={30} />);
  expect(compass).toHaveStyle({ transform: "rotate(30deg)" });

  rerender(<Navigator degree={260} />);
  expect(compass).toHaveStyle({ transform: "rotate(260deg)" });
});

test("it should rotate compass by mouse operation", async () => {
  const onRotateMock = vitest.fn();
  render(<Navigator degree={0} onRotate={onRotateMock} />);

  const compass = screen.getByLabelText("compass");

  if (!compass.parentElement) {
    throw new Error("compass.parentElement should be exist");
  }

  expect(compass).toHaveStyle({ transform: "rotate(0deg)" });

  fireEvent.mouseDown(compass.parentElement);
  expect(compass).toHaveStyle({ transform: "rotate(90deg)" });
  expect(onRotateMock).toBeCalledWith(90);

  onRotateMock.mockReset();

  fireEvent.mouseMove(window);
  expect(compass).toHaveStyle({ transform: "rotate(90deg)" });
  expect(onRotateMock).toBeCalledWith(90);

  onRotateMock.mockReset();

  fireEvent.mouseUp(window);
  fireEvent.mouseMove(window);
  expect(onRotateMock).not.toBeCalled();
});

test("it should orbit by mouse operation", async () => {
  const onOrbitMock = vitest.fn();
  const onRotateMock = vitest.fn();
  render(<Navigator degree={0} onRotate={onRotateMock} onOrbit={onOrbitMock} />);

  const angle = screen.getByLabelText("adjust angle");
  if (!angle.parentElement) {
    throw new Error("angle.parentElement should be exist");
  }

  expect(screen.queryByTestId("compassFocus")).toBeNull();

  fireEvent.mouseDown(angle.parentElement);

  const compassFocus = screen.queryByTestId("compassFocus");
  expect(compassFocus).toBeInTheDocument();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(compassFocus).toHaveStyle({ transform: "rotate(90deg)" });
  expect(onOrbitMock).toBeCalledWith({ x: 0, y: 0, degree: 90 });

  onOrbitMock.mockReset();

  fireEvent.mouseMove(window);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(compassFocus).toHaveStyle({ transform: "rotate(90deg)" });
  expect(onOrbitMock).toBeCalledWith({ x: 0, y: 0, degree: 90 });

  // it should do auto rotate when compassFocus degree is `0 <= degree <= 180`
  await waitFor(() => {
    expect(onRotateMock).toBeCalledWith(5);
  });

  fireEvent.mouseMove(window, { clientX: -10, clientY: -10 });
  // it should do auto reverse rotation when compassFocus degree is other than `0 <= degree <= 180`
  await waitFor(() => {
    expect(onRotateMock).toBeCalledWith(0);
  });

  onOrbitMock.mockReset();

  fireEvent.mouseUp(window);
  fireEvent.mouseMove(window);
  expect(onOrbitMock).not.toBeCalled();
});
