import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorFrame } from "./error-frame";

describe("ErrorFrame", () => {
  it("is an alert with a Try again button that calls onRetry", async () => {
    const onRetry = vi.fn();
    render(<ErrorFrame onRetry={onRetry} />);

    expect(screen.getByTestId("error-frame")).toHaveAttribute("role", "alert");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders a custom title and message", () => {
    render(<ErrorFrame title="Oops" message="Broken" onRetry={() => {}} />);
    expect(screen.getByRole("heading", { name: "Oops" })).toBeInTheDocument();
    expect(screen.getByText("Broken")).toBeInTheDocument();
  });
});
