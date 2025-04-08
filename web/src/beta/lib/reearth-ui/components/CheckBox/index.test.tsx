import { fireEvent, render } from "@reearth/test/utils";
import { expect, describe, it } from "vitest";

import { CheckBox } from "./";

describe("CheckBox", () => {
  it("shows check icon after click when initially unchecked", async () => {
    const { container } = render(<CheckBox value={false} />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();

    const boxField = container.querySelector("div");
    expect(boxField).toBeInTheDocument();

    if (boxField) {
      fireEvent.click(boxField);
    }
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("does not show check icon when clicked if disabled", () => {
    const { container } = render(<CheckBox value={false} disabled />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();

    const boxField = container.querySelector("div");
    expect(boxField).toBeInTheDocument();

    if (boxField) {
      fireEvent.click(boxField);
    }

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
