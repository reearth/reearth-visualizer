import React from "react";

import { render, screen, fireEvent } from "../../../test/utils";

import Tag from ".";

test("component should be renered", () => {
  render(<Tag id="id" label="label" />);
});

test("component should render text and icon", () => {
  render(<Tag icon="bin" id="tag" label="tag" />);
  expect(screen.getByText("tag")).toBeInTheDocument();
  expect(screen.getByTestId(/atoms-tag-event-trigger/)).toBeInTheDocument();
});

test("component should fire event", () => {
  const handleRemove = jest.fn();
  render(<Tag icon="bin" id="tag" label="tag" onRemove={handleRemove} />);
  fireEvent.click(screen.getByTestId("atoms-tag-event-trigger"));
  expect(handleRemove).toHaveBeenCalled();
});
