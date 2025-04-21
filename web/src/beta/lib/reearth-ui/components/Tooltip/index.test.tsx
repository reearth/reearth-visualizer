import { screen, render } from "@reearth/test/utils";
import { describe, test, expect } from "vitest";

import Tooltip from "./index";

describe("Tooltip Component", () => {
  test("renders experimental tooltip with default flask icon", () => {
    render(<Tooltip type="experimental" />);

    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("renders custom tooltip with provided icon", () => {
    render(<Tooltip type="custom" icon="book" text="Custom tooltip text" />);

    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("renders with custom trigger component", () => {
    const CustomTrigger = () => (
      <div data-testid="custom-trigger">Custom Trigger</div>
    );
    render(
      <Tooltip
        type="custom"
        text="Tooltip text"
        triggerComponent={<CustomTrigger />}
      />
    );

    expect(screen.getByTestId("custom-trigger")).toBeInTheDocument();
  });

  test("renders tips text when no icon or trigger component is provided", () => {
    render(<Tooltip type="custom" text="Help text" />);

    expect(screen.getByText("TIPS")).toBeInTheDocument();
  });
});
