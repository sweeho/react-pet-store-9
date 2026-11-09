import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyFrame } from "./empty-frame";

describe("EmptyFrame", () => {
  it("renders the default message", () => {
    render(<EmptyFrame />);
    expect(screen.getByTestId("empty-frame")).toHaveTextContent("Nothing to show yet");
  });

  it("renders a custom title, message and actions", () => {
    render(
      <EmptyFrame title="No pets" message="Try later">
        <button>Go</button>
      </EmptyFrame>,
    );
    expect(screen.getByRole("heading", { name: "No pets" })).toBeInTheDocument();
    expect(screen.getByText("Try later")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });
});
