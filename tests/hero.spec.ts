import { test, expect } from "@playwright/test";

test.describe("Hero headline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders both headline lines", async ({ page }) => {
    const h1 = page.locator("h1").first();
    await expect(h1).toContainText("Your next score");
    await expect(h1).toContainText("is next door");
  });

  test("headline does not overflow its column on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const h1 = page.locator("h1").first();
    const col = page.locator("section").first().locator("div").first().locator("div").first();

    const h1Box = await h1.boundingBox();
    const colBox = await col.boundingBox();

    expect(h1Box).not.toBeNull();
    expect(colBox).not.toBeNull();
    // Headline must not be wider than its containing column
    expect(h1Box!.width).toBeLessThanOrEqual(colBox!.width + 4);
  });

  test("headline does not overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const h1 = page.locator("h1").first();
    const h1Box = await h1.boundingBox();

    expect(h1Box).not.toBeNull();
    // Must not overflow viewport width
    expect(h1Box!.x + h1Box!.width).toBeLessThanOrEqual(390 + 4);
  });

  test("headline font size class is within safe range", async ({ page }) => {
    const h1 = page.locator("h1").first();
    const fontSize = await h1.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).fontSize)
    );
    // Must be between 32px (text-3xl) and 80px (text-7xl) — flag anything bigger
    expect(fontSize).toBeGreaterThanOrEqual(32);
    expect(fontSize).toBeLessThanOrEqual(80);
  });
});
