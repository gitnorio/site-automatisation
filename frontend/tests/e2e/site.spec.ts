import { expect, test } from "@playwright/test";

test("discovery landing and demo journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Le bon brief/i })).toBeVisible();
  await expect(page.getByText(/Chaque réponse devient du contexte exploitable/i)).toBeVisible();
  await page.getByRole("link", { name: "Demander une démo" }).first().click();
  await expect(page).toHaveURL(/\/contact/);
});

test("removed pages are not linked", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/solutions"]')).toHaveCount(0);
  await expect(page.locator('a[href="/confidentialite"]')).toHaveCount(0);
  await expect(page.locator('a[href="/approche"]')).toHaveCount(0);
});
