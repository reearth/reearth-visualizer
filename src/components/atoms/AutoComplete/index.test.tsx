import { expect, test, vi } from "vitest";

import { fireEvent, render, screen } from "@reearth/test/utils";

import AutoComplete from "./index";

const sampleItems: { value: string; label: string }[] = [
  {
    value: "hoge",
    label: "hoge",
  },
  {
    value: "fuga",
    label: "fuga",
  },
];

test("should render items", async () => {
  render(<AutoComplete items={sampleItems} />);
  expect(screen.getByText(/hoge/)).toBeInTheDocument();
  expect(screen.getByText(/fuga/)).toBeInTheDocument();
});

test("should be inputtable", async () => {
  render(<AutoComplete items={sampleItems} />);

  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "hoge" } });
  expect(screen.getByText("hoge")).toBeInTheDocument();
});

test("should leave selects hit", async () => {
  render(<AutoComplete items={sampleItems} />);

  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "hoge" } });
  expect(screen.getByText("hoge")).toBeInTheDocument();
});

test("shouldn't leave selects which don't hit inputted text", async () => {
  render(<AutoComplete items={sampleItems} />);

  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "hoge" } });
  expect(screen.queryByText("fuga")).not.toBeInTheDocument();
});

test("should trigger onSelect function with click event", async () => {
  const handleSelect = vi.fn();
  render(<AutoComplete items={sampleItems} onSelect={handleSelect} />);

  const input = screen.getByRole("textbox");

  fireEvent.change(input, { target: { value: "hoge" } });
  const option = screen.getByText(/hoge/);
  fireEvent.click(option);

  expect(handleSelect).toBeCalled();
  expect(handleSelect.mock.calls[0][0]).toBe("hoge");
});
