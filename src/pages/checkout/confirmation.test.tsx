import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import ConfirmationPage from "./confirmation";

const at = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/checkout/confirmation", state }]}>
      <ConfirmationPage />
    </MemoryRouter>,
  );

describe("order confirmation page", () => {
  it("[SWHR8-C-0181] shows the order number and the bill-to e-mail", () => {
    at({ orderNumber: 1023, email: "sam.kim@example.com" });
    expect(screen.getByText("1023")).toBeInTheDocument();
    expect(screen.getByText("sam.kim@example.com")).toBeInTheDocument();
  });

  it("[SWHR8-C-0183] omits the e-mail row when it is blank", () => {
    at({ orderNumber: 1024, email: "" });
    expect(screen.getByText("1024")).toBeInTheDocument();
    expect(screen.queryByText(/bill-to e-mail/i)).not.toBeInTheDocument();
  });
});
