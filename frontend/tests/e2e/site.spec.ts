import { expect, test } from "@playwright/test";

test("navigation, services and contact journey", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /L’intelligence artificielle/i })).toBeVisible();
  if (isMobile) await page.getByRole("button", { name: /ouvrir le menu/i }).click();
  await page.getByRole("link", { name: "Services", exact: true }).first().click();
  await expect(page).toHaveURL(/\/services/);
  await page.getByPlaceholder("Rechercher un service...").fill("soumission");
  await page.getByPlaceholder("Rechercher un service...").press("Enter");
  await page.getByRole("button", { name: /Ouvrir la fiche Traitement des demandes de soumission/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: /Discuter de ce service/i }).click();
  await expect(page).toHaveURL(/\/contact\?service=demandes-de-soumission/);
  await expect(page.getByText("Traitement des demandes de soumission")).toBeVisible();
});

test("removed pages are not linked", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/solutions"]')).toHaveCount(0);
  await expect(page.locator('a[href="/confidentialite"]')).toHaveCount(0);
  await expect(page.locator('a[href="/approche"]')).toHaveCount(0);
});
