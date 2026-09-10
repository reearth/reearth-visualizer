import { fireEvent, render, screen } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import ProjectImportErrorModal from "./ProjectImportErrorModal";

describe("ProjectImportErrorModal", () => {
  it("renders the failure message and possible causes", () => {
    render(<ProjectImportErrorModal />);

    expect(
      screen.getByText("We were unable to import the project.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("File corruption or incomplete upload")
    ).toBeInTheDocument();
    expect(screen.getByText("Version incompatibility")).toBeInTheDocument();
    expect(screen.getByText("Permission restrictions")).toBeInTheDocument();
    expect(screen.getByText("A temporary system error")).toBeInTheDocument();
  });

  it("calls onProjectImportErrorLogDownload when the download button is clicked", () => {
    const onProjectImportErrorLogDownload = vi.fn();
    render(
      <ProjectImportErrorModal
        onProjectImportErrorLogDownload={onProjectImportErrorLogDownload}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Download Error Log" })
    );

    expect(onProjectImportErrorLogDownload).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the Ok button is clicked", () => {
    const onClose = vi.fn();
    render(<ProjectImportErrorModal onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Ok" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
