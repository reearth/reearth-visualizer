import { render, screen } from "@reearth/test/utils";
import { describe, it, expect } from "vitest";

import CommonField from "./index";

describe("CommonField", () => {
  it("renders with title and description", () => {
    render(<CommonField title="Test Title" description="Test Description" />);
    expect(screen.getByText("Test Title")).toBeDefined();
    expect(screen.getByText("Test Description")).toBeDefined();
  });

  it("renders children correctly", () => {
    render(
      <CommonField>
        <div data-testid="child-element">Child Content</div>
      </CommonField>
    );
    expect(screen.getByTestId("child-element")).toHaveTextContent(
      "Child Content"
    );
  });
});
