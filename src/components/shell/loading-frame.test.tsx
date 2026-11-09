import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingFrame } from "./loading-frame";

describe("LoadingFrame", () => {
  it("is a status region with a label", () => {
    render(<LoadingFrame label="Fetching" />);
    expect(screen.getByRole("status")).toHaveTextContent("Fetching");
    expect(screen.getByTestId("loading-frame")).toBeInTheDocument();
  });
});
