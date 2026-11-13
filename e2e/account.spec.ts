import { expect, test } from "@playwright/test";

// One journey: register, fill in the customer form, see the welcome page, sign off, sign on again.
test("[SWHR8-C-0056] a visitor registers, completes the customer form, signs off and signs on again", async ({
  page,
}) => {
  const userName = `j${Date.now().toString(36)}`.slice(0, 25);
  await page.goto("/register");
  await page.getByLabel("User name", { exact: true }).fill(userName);
  await page.getByLabel("Password").fill("pw");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Some required details are missing")).toBeVisible();

  await page.getByLabel("First name").fill("Sophie");
  await page.getByLabel("Last name").fill("Tanaka");
  await page.getByLabel("Telephone").fill("555-0100");
  await page.getByLabel("Street address").fill("1 Harbor Blvd");
  await page.getByLabel("City").fill("Palo Alto");
  await page.getByLabel("State or province").fill("CA");
  await page.getByLabel("Postal code").fill("94303");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Welcome, Sophie" })).toBeVisible();

  await expect(page.getByRole("button", { name: `Hi, ${userName}` })).toBeVisible();
  await page.getByRole("button", { name: "Sign off" }).click();
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();

  await page.goto("/signon");
  await page.getByLabel("User name", { exact: true }).fill(userName);
  await page.getByLabel("Password").fill("pw");
  await page.getByRole("button", { name: "Sign on" }).click();
  await expect(page.getByRole("heading", { name: "Welcome, Sophie" })).toBeVisible();
});
