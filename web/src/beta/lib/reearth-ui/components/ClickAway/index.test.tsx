import { fireEvent, render, screen } from "@reearth/test/utils";
import { expect, describe, it } from "vitest";

import { ClickAway } from ".";

describe("ClickAway", () => {
  it("should call onClickAway when click outside", () => {
    let hasClickedAway = false;

    const handleClickAway = () => {
      hasClickedAway = true;
    };

    render(
      <div>
        <ClickAway onClickAway={handleClickAway}>
          <div data-testid="inside">Inside</div>
        </ClickAway>
        <div data-testid="outside">Outside</div>
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId("inside"));
    expect(hasClickedAway).toBe(false);

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(hasClickedAway).toBe(true);
  });
});
