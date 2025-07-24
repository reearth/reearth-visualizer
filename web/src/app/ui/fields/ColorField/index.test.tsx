import { render } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import ColorInputField, { ColorInputFieldProps } from "./index";

describe("ColorInputField", () => {
  it("should render without crashing", () => {
    const props: ColorInputFieldProps = {
      title: "Test Title",
      description: "Test Description",
      value: "#ffffff",
      onChange: vi.fn()
    };

    const { getByText } = render(<ColorInputField {...props} />);

    expect(getByText("Test Title")).toBeInTheDocument();
    expect(getByText("Test Description")).toBeInTheDocument();
  });
});
