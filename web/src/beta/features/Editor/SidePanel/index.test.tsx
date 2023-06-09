import { expect, test, describe } from "vitest";

import { render, screen } from "@reearth/test/utils";

import SidePanel from ".";

describe("SidePanel", () => {
  test("display contents", () => {
    render(
      <SidePanel
        location="left"
        contents={[
          { id: "1", title: "1", children: "content1" },
          { id: "2", title: "2", children: "content2", maxHeight: "30%" },
        ]}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("content1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("content2")).toBeInTheDocument();
  });
});
