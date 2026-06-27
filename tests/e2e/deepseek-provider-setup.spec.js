import { test, expect } from "playwright/test";

test("deepseek setup modal accepts token without name", async ({ page }) => {
  await page.goto("http://127.0.0.1:20127/dashboard/providers/deepseek-web");

  await page.getByRole("button", { name: "Add" }).first().click();

  const tokenInput = page.getByLabel("Cookie Value").first();
  await expect(tokenInput).toHaveAttribute("placeholder", /USER_TOKEN|Bearer USER_TOKEN/i);

  await tokenInput.fill("USER_TOKEN_EXAMPLE");
  const saveButton = page.getByRole("button", { name: "Save" }).first();
  await expect(saveButton).toBeEnabled();
});
