import { expect, test } from "vitest";

import { render, screen } from "@reearth/test/utils";

import TabButton from ".";

const handleClick = () => {};

test("1. should be rendered", () => {
  render(<TabButton label="test1" onClick={handleClick} selected={false} />);
});

test("2. should display button label", () => {
  render(<TabButton label="test2" onClick={handleClick} selected={false} />);
  expect(screen.getByRole("button")).toBeInTheDocument();
  expect(screen.getByText(/test2/)).toBeInTheDocument();
});

test("3. should disabled true button", () => {
  render(<TabButton label="test3" onClick={handleClick} selected={true} />);
  expect(screen.getByRole("button")).toBeDisabled();
});

test("4. should disabled false button", () => {
  render(<TabButton label="test4" onClick={handleClick} selected={false} />);
  expect(screen.getByRole("button")).not.toBeDisabled();
});
