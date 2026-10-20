import { expect, test } from "@playwright/test";

// Proves the built site serves and renders. Real behaviour tests start in B3.
test("placeholder home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
