import { expect, test, vitest } from "vitest";

import { fireEvent, render, screen } from "@reearth/test/utils";

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
  const onMoveOrbitMock = vitest.fn();
  const onStartOrbitMock = vitest.fn();
  const onEndOrbitMock = vitest.fn();
  const onRotateMock = vitest.fn();
  render(
    <Navigator
      degree={0}
      onRotate={onRotateMock}
      onStartOrbit={onStartOrbitMock}
      onEndOrbit={onEndOrbitMock}
      onMoveOrbit={onMoveOrbitMock}
    />,
  );

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
  expect(onStartOrbitMock).toBeCalled();
  expect(onMoveOrbitMock).toBeCalledWith(90);

  onMoveOrbitMock.mockReset();

  fireEvent.mouseMove(window);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(compassFocus).toHaveStyle({ transform: "rotate(90deg)" });
  expect(onMoveOrbitMock).toBeCalledWith(90);

  fireEvent.mouseMove(window, { clientX: -10, clientY: -10 });

  onMoveOrbitMock.mockReset();

  fireEvent.mouseUp(window);
  expect(onEndOrbitMock).toBeCalled();

  fireEvent.mouseMove(window);
  expect(onMoveOrbitMock).not.toBeCalled();
});
