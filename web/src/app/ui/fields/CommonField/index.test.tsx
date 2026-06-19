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

  describe("Decoration Slots", () => {
    it("renders titleAdornment next to title", () => {
      render(
        <CommonField
          title="Test Title"
          titleAdornment={<span data-testid="adornment">Badge</span>}
        >
          <input />
        </CommonField>
      );

      expect(screen.getByTestId("commonfield-title-row")).toBeInTheDocument();
      expect(screen.getByTestId("commonfield-title-adornment")).toBeInTheDocument();
      expect(screen.getByTestId("adornment")).toHaveTextContent("Badge");
    });

    it("renders beforeInput decoration before children", () => {
      render(
        <CommonField
          title="Test"
          beforeInput={<div data-testid="before-input">Warning message</div>}
        >
          <input data-testid="input" />
        </CommonField>
      );

      const beforeInput = screen.getByTestId("before-input");
      const input = screen.getByTestId("input");

      expect(beforeInput).toBeInTheDocument();
      expect(
        beforeInput.compareDocumentPosition(input) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it("renders afterInput decoration after children", () => {
      render(
        <CommonField
          title="Test"
          afterInput={<div data-testid="after-input">Helper text</div>}
        >
          <input data-testid="input" />
        </CommonField>
      );

      const afterInput = screen.getByTestId("after-input");
      const input = screen.getByTestId("input");

      expect(afterInput).toBeInTheDocument();
      expect(
        input.compareDocumentPosition(afterInput) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it("renders all decorations together", () => {
      render(
        <CommonField
          title="Test"
          titleAdornment={<span data-testid="adornment">Badge</span>}
          beforeInput={<div data-testid="before">Warning</div>}
          afterInput={<div data-testid="after">Helper</div>}
          description="Description"
        >
          <input data-testid="input" />
        </CommonField>
      );

      expect(screen.getByTestId("adornment")).toBeInTheDocument();
      expect(screen.getByTestId("before")).toBeInTheDocument();
      expect(screen.getByTestId("input")).toBeInTheDocument();
      expect(screen.getByTestId("after")).toBeInTheDocument();
      expect(screen.getByTestId("commonfield-description")).toBeInTheDocument();
    });

    it("does not render decoration slots when not provided", () => {
      render(
        <CommonField title="Test">
          <input />
        </CommonField>
      );

      expect(
        screen.queryByTestId("commonfield-title-adornment")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("commonfield-before-input")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("commonfield-after-input")
      ).not.toBeInTheDocument();
    });
  });
});
