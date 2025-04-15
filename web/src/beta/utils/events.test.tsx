import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vitest } from "vitest";

import { stopClickPropagation } from "./events";

describe("stopClickPropagation", () => {
  it("should prevent event propagation when called", () => {
    const mockEvent = {
      stopPropagation: vitest.fn()
    } as unknown as React.MouseEvent<Element>;

    stopClickPropagation(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("should handle undefined event gracefully", () => {
    expect(() => {
      stopClickPropagation(undefined);
    }).not.toThrow();
  });

  it("integration test with React components", () => {
    const parentClickHandler = vitest.fn();
    const childClickHandler = vitest.fn();

    const TestComponent = () => (
      <div data-testid="parent" onClick={parentClickHandler}>
        <div
          data-testid="child"
          onClick={(e) => {
            stopClickPropagation(e);
            childClickHandler();
          }}
        >
          Click me
        </div>
      </div>
    );

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId("child"));

    expect(childClickHandler).toHaveBeenCalledTimes(1);
    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});
