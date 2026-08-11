import { expect, test } from "@playwright/test";

test("marketing landing keeps its navigation and demo journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Le contexte qui fait avancer/i })).toBeVisible();
  await expect(page.locator(".site-header")).toBeVisible();
  await expect(page.locator(".site-footer")).toBeVisible();
  await page.getByRole("link", { name: "Demander une démo" }).first().click();
  await expect(page).toHaveURL(/\/contact/);
});

test("workspace redirects and excludes marketing chrome", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/app\/consultations/);
  await expect(page.locator(".enterprise-shell")).toBeVisible();
  await expect(page.locator(".site-header")).toHaveCount(0);
  await expect(page.locator(".site-footer")).toHaveCount(0);
});

test("prospect experience excludes marketing chrome", async ({ page }) => {
  await page.goto("/c/demo-consultation");
  await expect(page.locator(".prospect-experience")).toBeVisible();
  await expect(page.locator(".site-header")).toHaveCount(0);
  await expect(page.locator(".site-footer")).toHaveCount(0);
});

test("removed pages are not linked", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/solutions"]')).toHaveCount(0);
  await expect(page.locator('a[href="/confidentialite"]')).toHaveCount(0);
  await expect(page.locator('a[href="/approche"]')).toHaveCount(0);
});
